const redisClient = require('./redis');

(async () => {
  console.log('Is Redis alive?', redisClient.isAlive());

  console.log('Setting key "setCheckerKey" to 89...');
  await redisClient.set('setCheckerKey', 89);
  console.log('Getting key "setCheckerKey":', await redisClient.get('setCheckerKey'));

  console.log('Setting key "setCheckerKey" to 89 with 3 seconds expiry...');
  await redisClient.set('setCheckerKey', 89, 3);
  console.log('Getting key "setCheckerKey":', await redisClient.get('setCheckerKey'));

  console.log('Deleting key "setCheckerKey"...');
  await redisClient.del('setCheckerKey');
  console.log('Getting key "setCheckerKey" after deletion:', await redisClient.get('setCheckerKey'));
})();
