'use strict';


module.exports = {
    up(db, next) {
        // db.createCollection("users", {
        //     validator: {
        //         $jsonSchema: {
        //             bsonType: "object",
        //             required: ["email", 'password', 'color'],
        //             properties: {
        //                 email: {
        //                     bsonType: "string",
        //                     pattern: "@mongodb\.com$",
        //                 },
        //                 password: {
        //                     bsonType: "string",
        //                     required: true
        //                 },
        //                 isAdmin: {
        //                     bsonType: "bool",
        //                     default: false
        //                 },
        //                 isBan: {
        //                     bsonType: "bool",
        //                     default: false
        //                 },
        //                 isMute: {
        //                     bsonType: "bool",
        //                     default: false
        //                 },
        //                 color: {
        //                     bsonType: "string",
        //                     required: true,
        //                     unique: true
        //                 },
        //             }
        //         }
        //     }
        // });

        db.users.insert({
            "isAdmin": true,
            "isBan": false,
            "isMute": false,
            "color": "#807E3D",
            "email": "admin@admin.com",
            "password": "$2a$10$HWIdCW5YgbEqEI2kOo0BsuF01Vp345F3YBijcncanKbYKTpAgVV2.",
        });
        next();
    },

    down(db, next) {
        // TODO write the statements to rollback your migration (if possible)
        next();
    }

};
