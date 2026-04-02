const axios = require('axios');

async function testJudge0() {
    try {
        const res = await axios.post('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
            language_id: 93,
            source_code: `console.log(false);`,
            expected_output: `true`
        });
        console.log("Judge0 Status ID for false vs true:", res.data.status);
        console.log("Stdout:", JSON.stringify(res.data.stdout));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}

testJudge0();
