/* eslint-disable no-undef */
// Env variables to configure the broker

const envConf = require('dotenv');

envConf.config();

let {
    PORT,
    MQTT_PORT,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_DATABASE,
    REDIS_PORT,
    MQTT_USER,
    MQTT_PASSWORD
} = process.env;

module.exports = {
    PORT,
    MQTT_PORT,
    MQTT_USER,
    MQTT_PASSWORD,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_DATABASE,
    REDIS_PORT
}