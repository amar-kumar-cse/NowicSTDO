const fs = require('fs');
const path = require('path');

const dataFile = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\1810db71-6e9e-49fd-9cfa-5a33ca325207\\scratch\\extracted_data_utf8.jsonl';
const dbPath = 'C:\\Users\\Asus\\Desktop\\NowicME\\NowicSTDO\\Backend\\dev.sqlite3';

// Icon mapping helper
function getRandomIcon() {
    const icons = ['Rocket', 'Bot', 'Layers', 'Gauge', 'Cpu', 'Code2', 'Sparkles', 'Globe', 'Zap', 'Trophy', 'Users', 'Star', 'ShieldCheck'];
    return icons[Math.floor(Math.random() * icons.length)];
}

async function run() {
    const lines = fs.readFileSync(dataFile, 'utf8').split('\n');
    let contentStr = '';
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'USER_INPUT' && parsed.content.includes('Detailed Services Raw Data Extraction')) {
                contentStr = parsed.content;
                break;
            }
        } catch(e) {}
    }

    if (!contentStr) {
        console.error('Could not find content in jsonl');
        return;
    }

    const serviceBlocks = contentStr.split('Service: ').slice(1);
    const mappedServices = [];

    for (let block of serviceBlocks) {
        const lines = block.split('\n');
        const slug = lines[0].trim();
        
        let code = lines.slice(1).join('\n');
        
        // Remove markdown tags if any
        code = code.replace(/```javascript/g, '').replace(/```/g, '');
        
        // Replace `icon: ,` or `icon: Cpu,` with `icon: "Cpu",`
        code = code.replace(/icon:\s*([a-zA-Z0-9_]+)?,/g, (match, p1) => {
            if (!p1) return `icon: "${getRandomIcon()}",`;
            return `icon: "${p1}",`;
        });
        code = code.replace(/icon:\s*([a-zA-Z0-9_]+)?\s*\}/g, (match, p1) => {
            if (!p1) return `icon: "${getRandomIcon()}" }`;
            return `icon: "${p1}" }`;
        });

        // Remove any line that is just 'n' or doesn't have a const definition at the top level
        code = code.replace(/^n$/gm, '');
        if (code.includes('const faqs =')) {
            const parts = code.split('const faqs =');
            code = parts[0] + 'const faqs =' + parts[1].split('];')[0] + '];';
        }
        
        // Add dummy exports so we can eval it
        code += `\n return { heroContent, introduction: (typeof introduction !== 'undefined' ? introduction : ''), services: (typeof webServices !== 'undefined' ? webServices : typeof appServices !== 'undefined' ? appServices : typeof customSoftwareServices !== 'undefined' ? customSoftwareServices : typeof marketingServices !== 'undefined' ? marketingServices : typeof designServices !== 'undefined' ? designServices : typeof aiServices !== 'undefined' ? aiServices : []), process: (typeof developmentProcess !== 'undefined' ? developmentProcess : typeof marketingProcess !== 'undefined' ? marketingProcess : typeof designProcess !== 'undefined' ? designProcess : []), whyChooseUsData, faqs };`;
        
        try {
            const func = new Function(code);
            const data = func();
            
            // Map keys
            const finalService = {
                slug: slug,
                heroContent: data.heroContent,
                introduction: data.introduction,
                subServices: data.services.map(s => ({
                    title: s.title,
                    description: s.description,
                    icon: s.icon,
                    features: s.keyFeatures || s.tools || []
                })),
                process: data.process.map(p => ({
                    step: p.number,
                    title: p.title,
                    description: p.description
                })),
                whyChooseUs: data.whyChooseUsData.map(w => ({
                    icon: w.icon,
                    title: w.title,
                    description: w.description
                })),
                faqs: data.faqs.map(f => ({
                    q: f.question,
                    a: f.answer
                }))
            };
            mappedServices.push(finalService);
        } catch (e) {
            console.error('Failed to parse block for', slug, e);
        }
    }

    console.log(`Parsed ${mappedServices.length} services.`);
    
    fs.writeFileSync('C:\\Users\\Asus\\Desktop\\NowicME\\NowicSTDO\\Backend\\mapped_services.json', JSON.stringify(mappedServices, null, 2));
    console.log('Saved mapped_services.json');
}

run();
