'use strict';

module.exports = {

    up(db, next) {
        db.createCollection("users", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["email", 'password', 'color'],
                    properties: {
                        email: {
                            bsonType: "string",
                            //pattern: "@mongodb\.com$",
                        },
                        password: {
                            bsonType: "string",
                        },
                        isAdmin: {
                            bsonType: "bool",
                        },
                        isBan: {
                            bsonType: "bool",
                        },
                        isMute: {
                            bsonType: "bool",
                        },
                        color: {
                            bsonType: "string",
                        },
                    }
                }
            },
        }, function (error, collection) {
            db.collection("users").createIndex({color: 1}, {unique: true});
            db.collection("users").createIndex({email: 1}, {unique: true});

            db.collection("users").insert({
                "isAdmin": true,
                "isBan": false,
                "isMute": false,
                "color": "#807E3D",
                "email": "admin@admin.com",
                "password": "$2a$10$HWIdCW5YgbEqEI2kOo0BsuF01Vp345F3YBijcncanKbYKTpAgVV2.",
            }, next);
        });
    },

    down(db, next) {
        db.dropCollection('users');
        next();
    }

};