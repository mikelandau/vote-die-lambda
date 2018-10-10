const api = require('lambda-api')();
const repository = require('./repository');

api.get('/candidates', (req, res) => {
    console.log('GET candidates');
    repository.getCandidates()
        .then((candidates) => {
            console.log('we got: ', JSON.stringify(candidates));
            res.send(candidates);
        })
        .catch((err) => {
            res.status(500).error(JSON.stringify(err));
        });
});

api.post('/candidates', (req, res) => {
    console.log('POST candidates');
    if(!req.body.name){
        res.status(400).error('Missing name');
        return;
    }
    repository.addCandidate(req.body.name)
        .then(() => {
            res.status(201);
        })
        .catch((err) => {
            res.status(500).error(JSON.stringify(err));
        });
});

api.post('/vote', async (req, res) => {
    console.log('POST vote');
    if(!req.body.candidateId){
        res.status(400).error('Missing candidateId');
        return;
    }
    repository.vote(req.body.candidateId)
        .then(() => {
            res.status(201);
        })
        .catch((err) => {
            res.status(500).error(JSON.stringify(err));
        });
});

api.post('/die', async (req, res) => {
    console.log('POST die');

    repository.getCandidates()
        .then((candidates) => {
            if(!candidates || candidates.length === 0){
                res.status(200);
                return;
            }
            candidates.sort((a, b) => b.votes - a.votes);
            return repository.deleteCandidate(candidates[0].id);
        })
        .then(() => {
            res.status(200);
        })
        .catch((err) => {
            res.status(500).error(JSON.stringify(err));
        });
});

exports.handler = (event, context, callback) => {
    return api.run(event, context, callback);
}
