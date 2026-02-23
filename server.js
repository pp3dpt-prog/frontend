const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/generate-stl', async (req, res) => {
    const { forma, nome, telefone, tamFonte, tamFonteVerso, temNFC } = req.body;
    
    const id = Date.now();
    const filename = `medalha_${id}.stl`;
    const tempScad = `temp_${id}.scad`;

    // O segredo: Importamos o STL e escrevemos no centro (X=0, Y=0)
    const scadCode = `
$fn = 100;
union() {
    // 1. Importa o template físico (Deve estar na pasta /templates do servidor)
    import("templates/${forma}.stl", convexity=3); 

    // 2. Nome na Frente (Relevo de 0.8mm no Z=2)
    color("white")
    translate([0, 0, 2])
        linear_extrude(height = 0.8)
            text("${nome}", size = ${tamFonte / 4}, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");

    // 3. Telefone no Verso (Cavado 1.2mm no Z=-2)
    // Usamos mirror para que ao virar a peça o texto esteja correto
    translate([0, 0, -2])
        mirror([1,0,0])
            linear_extrude(height = 1.2)
                text("${temNFC ? 'NFC' : telefone}", size = ${tamFonteVerso / 10}, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");
}
`;

    try {
        fs.writeFileSync(tempScad, scadCode);
        const cmd = `xvfb-run -a -s "-screen 0 640x480x24" openscad -o ${filename} ${tempScad}`;
        
        exec(cmd, async (error) => {
            if (error) return res.status(500).json({ error: "Erro na geração" });

            const fileBuffer = fs.readFileSync(filename);
            const { data, error: upError } = await supabase.storage
                .from('medalhas')
                .upload(`stls/${filename}`, fileBuffer, { contentType: 'model/stl' });

            if (upError) throw upError;

            // Limpeza de ficheiros temporários
            [tempScad, filename].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
            res.status(200).json({ success: true, file: data.path });
        });
    } catch (err) {
        res.status(500).send("Erro interno");
    }
});

app.listen(10000, '0.0.0.0', () => console.log("🚀 Servidor de Templates Online"));