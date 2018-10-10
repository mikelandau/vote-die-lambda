const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

module.exports = {
    'getCandidates': () => {
        console.log('Scanning');
        return new Promise((resolve, reject) => {
            const dynamoClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });
            dynamoClient.scan({
                TableName: 'vote-die',
                ProjectionExpression: "#i, #n, #v",
                ExpressionAttributeNames: {
                    '#i': 'id',
                    '#n': 'name',
                    '#v': 'votes'
                }
            }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!data || !data.Items){
                    resolve([]);
                    return;
                } 
                resolve(data.Items);
            });
        });
    },
    'addCandidate': (name) => {
        return new Promise((resolve, reject) => {
            const dynamoClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });
            dynamoClient.put({
                TableName: 'vote-die',
                Item: {
                    'id': uuid(),
                    'name': name,
                    'votes': 0
                }
            }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    },
    'vote': (candidateId) => {
        return new Promise((resolve, reject) => {
            const dynamoClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });
            dynamoClient.get({
                TableName: 'vote-die',
                Key: { 'id': candidateId }
            }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!data || !data.Item || !data.Item.votes){
                    resolve();
                    return;
                } 
                dynamoClient.update({
                    TableName: 'vote-die',
                    UpdateExpression: 'set votes = :v',
                    ExpressionAttributeValues: {
                        ':v': parseInt(data.Item.votes) + 1
                    }
                }, (err) => {
                    if (err) {
                        console.log(JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    },
    'deleteCandidate': (candidateId) => {
        return new Promise((resolve, reject) => {
            const dynamoClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });
            dynamoClient.delete({
                TableName: 'vote-die',
                Key: { 'id': candidateId }
            }, (err) => {
                if (err) {
                    console.log(JSON.stringify(err));
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
};