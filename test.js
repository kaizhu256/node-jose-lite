/* istanbul instrument in package jose_lite */
// assets.utility2.header.js - start
/* istanbul ignore next */
/* jslint utility2:true */
(function (globalThis) {
    "use strict";
    let ArrayPrototypeFlat;
    let TextXxcoder;
    let consoleError;
    let debugName;
    let local;
    debugName = "debug" + String("Inline");
    // init globalThis
    globalThis.globalThis = globalThis.globalThis || globalThis;
    // init debug_inline
    if (!globalThis[debugName]) {
        consoleError = console.error;
        globalThis[debugName] = function (...argList) {
        /*
         * this function will both print <argList> to stderr
         * and return <argList>[0]
         */
            consoleError("\n\n" + debugName);
            consoleError.apply(console, argList);
            consoleError("\n");
            // return arg0 for inspection
            return argList[0];
        };
    }
    // polyfill
    ArrayPrototypeFlat = function (depth) {
    /*
     * this function will polyfill Array.prototype.flat
     * https://github.com/jonathantneal/array-flat-polyfill
     */
        depth = (
            globalThis.isNaN(depth)
            ? 1
            : Number(depth)
        );
        if (!depth) {
            return Array.prototype.slice.call(this);
        }
        return Array.prototype.reduce.call(this, function (acc, cur) {
            if (Array.isArray(cur)) {
                // recurse
                acc.push.apply(acc, ArrayPrototypeFlat.call(cur, depth - 1));
            } else {
                acc.push(cur);
            }
            return acc;
        }, []);
    };
    Array.prototype.flat = Array.prototype.flat || ArrayPrototypeFlat;
    Array.prototype.flatMap = Array.prototype.flatMap || function flatMap(
        ...argList
    ) {
    /*
     * this function will polyfill Array.prototype.flatMap
     * https://github.com/jonathantneal/array-flat-polyfill
     */
        return this.map(...argList).flat();
    };
    String.prototype.trimEnd = (
        String.prototype.trimEnd || String.prototype.trimRight
    );
    String.prototype.trimStart = (
        String.prototype.trimStart || String.prototype.trimLeft
    );
    (function () {
        try {
            globalThis.TextDecoder = (
                globalThis.TextDecoder || require("util").TextDecoder
            );
            globalThis.TextEncoder = (
                globalThis.TextEncoder || require("util").TextEncoder
            );
        } catch (ignore) {}
    }());
    TextXxcoder = function () {
    /*
     * this function will polyfill TextDecoder/TextEncoder
     * https://gist.github.com/Yaffle/5458286
     */
        return;
    };
    TextXxcoder.prototype.decode = function (octets) {
    /*
     * this function will polyfill TextDecoder.prototype.decode
     * https://gist.github.com/Yaffle/5458286
     */
        let bytesNeeded;
        let codePoint;
        let ii;
        let kk;
        let octet;
        let string;
        string = "";
        ii = 0;
        while (ii < octets.length) {
            octet = octets[ii];
            bytesNeeded = 0;
            codePoint = 0;
            if (octet <= 0x7F) {
                bytesNeeded = 0;
                codePoint = octet & 0xFF;
            } else if (octet <= 0xDF) {
                bytesNeeded = 1;
                codePoint = octet & 0x1F;
            } else if (octet <= 0xEF) {
                bytesNeeded = 2;
                codePoint = octet & 0x0F;
            } else if (octet <= 0xF4) {
                bytesNeeded = 3;
                codePoint = octet & 0x07;
            }
            if (octets.length - ii - bytesNeeded > 0) {
                kk = 0;
                while (kk < bytesNeeded) {
                    octet = octets[ii + kk + 1];
                    codePoint = (codePoint << 6) | (octet & 0x3F);
                    kk += 1;
                }
            } else {
                codePoint = 0xFFFD;
                bytesNeeded = octets.length - ii;
            }
            string += String.fromCodePoint(codePoint);
            ii += bytesNeeded + 1;
        }
        return string;
    };
    TextXxcoder.prototype.encode = function (string) {
    /*
     * this function will polyfill TextEncoder.prototype.encode
     * https://gist.github.com/Yaffle/5458286
     */
        let bits;
        let cc;
        let codePoint;
        let ii;
        let length;
        let octets;
        octets = [];
        length = string.length;
        ii = 0;
        while (ii < length) {
            codePoint = string.codePointAt(ii);
            cc = 0;
            bits = 0;
            if (codePoint <= 0x0000007F) {
                cc = 0;
                bits = 0x00;
            } else if (codePoint <= 0x000007FF) {
                cc = 6;
                bits = 0xC0;
            } else if (codePoint <= 0x0000FFFF) {
                cc = 12;
                bits = 0xE0;
            } else if (codePoint <= 0x001FFFFF) {
                cc = 18;
                bits = 0xF0;
            }
            octets.push(bits | (codePoint >> cc));
            cc -= 6;
            while (cc >= 0) {
                octets.push(0x80 | ((codePoint >> cc) & 0x3F));
                cc -= 6;
            }
            ii += (
                codePoint >= 0x10000
                ? 2
                : 1
            );
        }
        return octets;
    };
    globalThis.TextDecoder = globalThis.TextDecoder || TextXxcoder;
    globalThis.TextEncoder = globalThis.TextEncoder || TextXxcoder;
    // init local
    local = {};
    local.local = local;
    globalThis.globalLocal = local;
    // init isBrowser
    local.isBrowser = (
        typeof globalThis.XMLHttpRequest === "function"
        && globalThis.navigator
        && typeof globalThis.navigator.userAgent === "string"
    );
    // init isWebWorker
    local.isWebWorker = (
        local.isBrowser && typeof globalThis.importScript === "function"
    );
    // init function
    local.assertOrThrow = function (passed, message) {
    /*
     * this function will throw err.<message> if <passed> is falsy
     */
        let err;
        if (passed) {
            return;
        }
        err = (
            (
                message
                && typeof message.message === "string"
                && typeof message.stack === "string"
            )
            // if message is errObj, then leave as is
            ? message
            : new Error(
                typeof message === "string"
                // if message is a string, then leave as is
                ? message
                // else JSON.stringify message
                : JSON.stringify(message, undefined, 4)
            )
        );
        throw err;
    };
    local.coalesce = function (...argList) {
    /*
     * this function will coalesce null, undefined, or "" in <argList>
     */
        let arg;
        let ii;
        ii = 0;
        while (ii < argList.length) {
            arg = argList[ii];
            if (arg !== null && arg !== undefined && arg !== "") {
                break;
            }
            ii += 1;
        }
        return arg;
    };
    local.fsRmrfSync = function (dir) {
    /*
     * this function will sync "rm -rf" <dir>
     */
        let child_process;
        try {
            child_process = require("child_process");
        } catch (ignore) {
            return;
        }
        child_process.spawnSync("rm", [
            "-rf", dir
        ], {
            stdio: [
                "ignore", 1, 2
            ]
        });
    };
    local.fsWriteFileWithMkdirpSync = function (file, data) {
    /*
     * this function will sync write <data> to <file> with "mkdir -p"
     */
        let fs;
        try {
            fs = require("fs");
        } catch (ignore) {
            return;
        }
        // try to write file
        try {
            fs.writeFileSync(file, data);
        } catch (ignore) {
            // mkdir -p
            require("child_process").spawnSync(
                "mkdir",
                [
                    "-p", require("path").dirname(file)
                ],
                {
                    stdio: [
                        "ignore", 1, 2
                    ]
                }
            );
            // rewrite file
            fs.writeFileSync(file, data);
        }
    };
    local.functionOrNop = function (fnc) {
    /*
     * this function will if <fnc> exists,
     * return <fnc>,
     * else return <nop>
     */
        return fnc || local.nop;
    };
    local.identity = function (val) {
    /*
     * this function will return <val>
     */
        return val;
    };
    local.nop = function () {
    /*
     * this function will do nothing
     */
        return;
    };
    local.objectAssignDefault = function (target, source) {
    /*
     * this function will if items from <target> are null, undefined, or "",
     * then overwrite them with items from <source>
     */
        target = target || {};
        Object.keys(source || {}).forEach(function (key) {
            if (
                target[key] === null
                || target[key] === undefined
                || target[key] === ""
            ) {
                target[key] = target[key] || source[key];
            }
        });
        return target;
    };
    local.querySelector = function (selectors) {
    /*
     * this function will return first dom-elem that match <selectors>
     */
        return (
            typeof document === "object" && document
            && typeof document.querySelector === "function"
            && document.querySelector(selectors)
        ) || {};
    };
    local.querySelectorAll = function (selectors) {
    /*
     * this function will return dom-elem-list that match <selectors>
     */
        return (
            typeof document === "object" && document
            && typeof document.querySelectorAll === "function"
            && Array.from(document.querySelectorAll(selectors))
        ) || [];
    };
    // require builtin
    if (!local.isBrowser) {
        local.assert = require("assert");
        local.buffer = require("buffer");
        local.child_process = require("child_process");
        local.cluster = require("cluster");
        local.crypto = require("crypto");
        local.dgram = require("dgram");
        local.dns = require("dns");
        local.domain = require("domain");
        local.events = require("events");
        local.fs = require("fs");
        local.http = require("http");
        local.https = require("https");
        local.net = require("net");
        local.os = require("os");
        local.path = require("path");
        local.querystring = require("querystring");
        local.readline = require("readline");
        local.repl = require("repl");
        local.stream = require("stream");
        local.string_decoder = require("string_decoder");
        local.timers = require("timers");
        local.tls = require("tls");
        local.tty = require("tty");
        local.url = require("url");
        local.util = require("util");
        local.vm = require("vm");
        local.zlib = require("zlib");
    }
}((typeof globalThis === "object" && globalThis) || (function () {
    return Function("return this")(); // jslint ignore:line
}())));
// assets.utility2.header.js - end



/* istanbul ignore next */
/* jslint utility2:true */
(function (local) {
"use strict";



// run shared js-env code - init-before
(function () {
// init local
local = globalThis.utility2 || require("utility2");
local = local.requireReadme();
globalThis.local = local;
// init test
local.testRunDefault(local);
}());



// run shared js-env code - function
(function () {
local.testCase_jose_default = async function (opt, onError) {
/*
 * this function will test jose's default handling-behavior
 */
    //!! let tokenDecrypted2;
    //!! let tokenDecrypted3;
    //!! let tokenDecrypted;
    //!! let tokenEncrypted2;
    //!! let tokenEncrypted;
    //!! if (local.isBrowser) {
        //!! onError(undefined, opt);
        //!! return;
    //!! }
    //!! globalThis.KEYOBJECT = globalThis.KEYOBJECT || Symbol("KEYOBJECT");
    //!! globalThis.deepClone = local.jsonCopy;
    //!! globalThis.jwtEpoch = function (date) {
        //!! return Math.floor(date.getTime() / 1000);
    //!! };
    //!! globalThis.jwtSecs = function (str) {
        //!! let matched = (
            //!! /^(\d+|\d+\.\d+)\u0020?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i
        //!! ).exec(str);
        //!! if (!matched) {
            //!! throw new TypeError("invalid time period format (" + str + ")");
        //!! }
        //!! const value = parseFloat(matched[1]);
        //!! const unit = matched[2].toLowerCase();
        //!! switch (unit) {
        //!! case "day":
        //!! case "days":
        //!! case "d":
            //!! return Math.round(value * 60 * 60 * 24);
        //!! case "hour":
        //!! case "hours":
        //!! case "hr":
        //!! case "hrs":
        //!! case "h":
            //!! return Math.round(value * 60 * 60);
        //!! case "minute":
        //!! case "minutes":
        //!! case "min":
        //!! case "mins":
        //!! case "m":
            //!! return Math.round(value * 60);
        //!! case "sec":
        //!! case "secs":
        //!! case "second":
        //!! case "seconds":
        //!! case "s":
            //!! return Math.round(value);
        //!! case "week":
        //!! case "weeks":
        //!! case "w":
            //!! return Math.round(value * 60 * 60 * 24 * 7);
        //!! case "year":
        //!! case "years":
        //!! case "yr":
        //!! case "yrs":
        //!! case "y":
            //!! return Math.round(value * 60 * 60 * 24 * 365.25);
        //!! }
    //!! };
    //!! local.RSAKey = require("./lib/jwk/rsa");
    //!! local.keyPrivate = new local.RSAKey(require(
        //!! "./lib/help/key_object"
    //!! ).createPrivateKey(`-----BEGIN PRIVATE KEY-----
//!! MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDAeyuckBoOSIYW
//!! emUxSLkat93gIQ9TD2pui6bcCGG44TN/S7D9I6058uSQQ7EeblynwJQ2Qe0Q1Ur8
//!! 7RXAXlRcGF61yWAScp/n31H0lVZU3VocQ+4R87b0lvHaTliqo3tTVZZg9Uogmf/F
//!! U1vGFvqC251KpAYjSiCtJs1vpQjFQgvKxtGYU3x3bmSzMO6R/QqSywcam5Tyit+S
//!! fELxGgvbbwJGaA0rujspoYEsC1r24V4FLNsQcJXomfaCK9bUJ9AVIraekGT+uOyW
//!! I/Ob0P4+T4NZb54XWd6jzPDuQCQxbRAGdURgBVhyrFJfjY6yXZ3SX8pqyRq9PTq6
//!! e8LOOJELAgMBAAECggEAMNYPdqXJNp6IBuP/EMYW0QSdsuQwcy6SHoIoT+OAh9v7
//!! qOyXd2K57N4Hx+Kk6ceukpF2CV4ovACiChJNVoWYedVlElKJoaSblcU/kgLh6J5Q
//!! 4qMJoFxpqx0xN+Zw8LqR687nXKpfqG3qSzKfMl9aKCF4gxuiwwlnyQbzUMRauVFb
//!! 7OLe3oIyn4wDavjGZH8pCFMvRw+Dtw/8yTx+TjQGaVJ4AWO7OvJs8IG/GjkU4M1y
//!! cmsMsAgt/HZNwEuHhA8CECmPHk8OcSjy7jRW+USn1e92e531LNfVscdifWk5kXyi
//!! DBYORZ0KTl0H99Kkqe85x6CPTCpjvMfb1UZ0uS0iwQKBgQDhQCOY2J2jceNbdwvg
//!! YyKsC6z5ZWXB9i5Mo1laWh5giWUxR0J41XeJV/LHrvWW3ffIJXIg31lgTuGsMkOF
//!! bHKMpl6THQ9293SvmJjiDLpS6RsS/e7VovCMZ4ZObAlDziihq7nlRWdk24YibcD1
//!! 3Yi8Hzdbu5+cuSxaGzXpweieuQKBgQDawdWZqLk3pc1/+3rRwCooODn06r6OltDo
//!! Bdc68jaIcZ3nG2rZwt4CI7srmiY4892G2YxOvmj12jFUAJGsfhXasWeXON0rXJF2
//!! NsPUcahbe0YbU14JwEQWC00JCClYECh6yHiUUREc3DGbFeh8jlIlRh7HyJHgcCZs
//!! B0BGTUDr4wKBgQC9em+3TlhkuhPPx/eUnK/426V48WPE4mqWCz7Js08kU89swY3Y
//!! CXGRdgsDEFkEvNmHYoB7yIXtbs2FRY7o+I3vZK/fvq1YnNZqM8o/NQezYOVmd3dl
//!! /Leu1BL1ewncINqrDMLGaziLbeKKqZqM9/rijLvLjau5cUcu0P7sETK1+QKBgQCl
//!! CkBAoY67cRfNSsmqnbQwi9sN8Fy77wTFSELNche6cR2UUpcWm3IrYxG/H5letn2X
//!! U2ILtpQxh+BXY+aDoMyUJevlpz0Vjc0gxsiP6v/9pM+LpiX4bVnw163S9plamzYv
//!! DDgMjey/PVEflDPGZQmMnY5zY9rK3VHfhsjzQS2NyQKBgQDQZdDE0Y4bHapEFvNz
//!! ez/X2wNEluRu6v8k4j455g4EDu8KTCmMH/U0ys/rK3IoYaYuqZawnDjyiyJ9NJHa
//!! cOAS0HofeNqu+SbQwPBQv+xHQK+sCNKzT6WM0WSSv2JoIR2jmlpOLkuwkE077D/q
//!! KxcmCpeLiMhJ83MOPcXYadKhSA==
//!! -----END PRIVATE KEY-----
//!! `));
    //!! local.keyPublic = new local.RSAKey(require(
        //!! "./lib/help/key_object"
    //!! ).createPublicKey(`-----BEGIN PUBLIC KEY-----
//!! MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHsrnJAaDkiGFnplMUi5
//!! Grfd4CEPUw9qboum3AhhuOEzf0uw/SOtOfLkkEOxHm5cp8CUNkHtENVK/O0VwF5U
//!! XBhetclgEnKf599R9JVWVN1aHEPuEfO29Jbx2k5YqqN7U1WWYPVKIJn/xVNbxhb6
//!! gtudSqQGI0ogrSbNb6UIxUILysbRmFN8d25kszDukf0KkssHGpuU8orfknxC8RoL
//!! 228CRmgNK7o7KaGBLAta9uFeBSzbEHCV6Jn2givW1CfQFSK2npBk/rjsliPzm9D+
//!! Pk+DWW+eF1neo8zw7kAkMW0QBnVEYAVYcqxSX42Osl2d0l/KaskavT06unvCzjiR
//!! CwIDAQAB
//!! -----END PUBLIC KEY-----`));
    //!! tokenDecrypted = require("./lib/jws/sign")({
        //!! "urn:example:claim": "foo"
    //!! }, local.keyPrivate, {
        //!! algorithm: "PS256",
        //!! audience: "urn:example:client_id",
        //!! expiresIn: "1 hour",
        //!! header: {
            //!! typ: "JWT"
        //!! },
        //!! issuer: "https://op.example.com"
    //!! });
    //!! tokenEncrypted = require(
        //!! "./lib/jwe.js"
    //!! ).encrypt(tokenDecrypted, local.keyPublic);
    //!! tokenEncrypted2 = require(
        //!! "./lib/jwe.js"
    //!! ).encrypt(tokenDecrypted, local.keyPrivate);
    //!! tokenDecrypted2 = String(require(
        //!! "./lib/jwe.js"
    //!! ).decrypt(tokenEncrypted, local.keyPrivate));
    //!! tokenDecrypted3 = String(require(
        //!! "./lib/jwe.js"
    //!! ).decrypt(tokenEncrypted2, local.keyPrivate));
    //!! local.assertJsonEqual(tokenDecrypted2, tokenDecrypted);
    //!! local.assertJsonEqual(tokenDecrypted3, tokenDecrypted);
    //!! require("./lib/jwt/verify")(tokenDecrypted, local.keyPrivate, {
        //!! issuer: "https://op.example.com",
        //!! audience: "urn:example:client_id",
        //!! algorithms: [
            //!! "PS256"
        //!! ]
    //!! });
    //!! //!! console.error(tokenDecrypted2);
    //!! //!! console.error(Buffer.from(tokenEncrypted, "base64").toString());
    //!! //!! console.error(tokenEncrypted);



    // jwe
    // https://tools.ietf.org/html/rfc7516#appendix-A.3
    let jweCek;
    let jweHeader;
    let jweKeySymmetric;
    let jwePlaintext;
    //!! let key;
    jwePlaintext = "Live long and prosper.";
    jweHeader = Buffer.from(
        "{\"alg\":\"A128KW\",\"enc\":\"A128CBC-HS256\"}"
    ).toString("base64").replace((
        /\=+/g
    ), "");
    local.assertJsonEqual(
        jweHeader,
        "eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0"
    );
    jweCek = String("BNMfxVSd/P4LZJ36P6pqzmt81C1vawnbyLEA8I+cLM8=").replace((
        /\=+/g
    ), "");
    jweKeySymmetric = {
        "kty": "oct",
        "k": "GawgguFyGrWKav7AX4VKUg"
    };
    console.error(jwePlaintext);
    console.error(Buffer.from(jweKeySymmetric.k, "base64").length * 8);
    console.error(Buffer.from(jweCek, "base64").length * 8);



    // wrap 256-bit jweCek
    // with 128-bit jweKeySymmetric "GawgguFyGrWKav7AX4VKUg"
    //!! const split = function (input, size) {
        //!! const output = [];
        //!! let ii = 0;
        //!! while (input.length > ii) {
            //!! output.push(input.slice(ii, ii + size));
            //!! ii += size;
        //!! }
        //!! return output;
    //!! };
    const uint64be = function (value) {
        let buf = Buffer.allocUnsafe(8);
        buf.writeUInt32BE(Math.floor(value / 0x100000000), 0);
        buf.writeUInt32BE(value | 0, 4);
        return buf;
    };
    const xor = function (a, b) {
        const len = Math.max(a.length, b.length);
        const result = Buffer.alloc(len);
        let ii = 0;
        while (len > ii) {
            result[ii] = (a[ii] || 0) ^ (b[ii] || 0);
            ii += 1;
        }
        return result;
    };
    const wrapKey = function (key, PP) {
    /*
     * https://tools.ietf.org/html/rfc3394#section-2.2.1
     */
        let AA;
        let IV;
        let RR;
        let buf;
        let cipher;
        let cnt;
        let crypto;
        let ii;
        let iv;
        let jj;
        crypto = require("crypto");
        iv = Buffer.alloc(16);
        RR = [];
        ii = 0;
        while (ii < PP.length) {
            RR.push(PP.slice(ii, ii + 8));
            ii += 8;
        }
        IV = Buffer.alloc(8, "a6", "hex");
        AA = IV;
        jj = 0;
        while (jj < 6) {
            ii = 0;
            while (ii < RR.length) {
                cnt = (RR.length * jj) + ii + 1;
                cipher = crypto.createCipheriv("aes128", key, iv);
                buf = Buffer.concat([
                    AA, RR[ii]
                ]);
                buf = cipher.update(buf);
                AA = xor(buf.slice(0, 8), uint64be(cnt));
                RR[ii] = buf.slice(8, 16);
                ii += 1;
            }
            jj += 1;
        }
        return Buffer.concat([
            AA
        ].concat(RR)).toString("base64").replace((
            /\=+/g
        ), "");
    };

    const unwrapKey = function (key, PP) {
        let AA;
        let IV;
        let RR;
        let buf;
        let cipher;
        let cnt;
        let crypto;
        let ii;
        let iv;
        let jj;
        crypto = require("crypto");
        iv = Buffer.alloc(16);
        RR = [];
        ii = 0;
        while (ii < PP.length) {
            RR.push(PP.slice(ii, ii + 8));
            ii += 8;
        }
        IV = Buffer.alloc(8, "a6", "hex");
        AA = RR[0];
        RR = RR.slice(1);
        jj = 5;
        while (0 <= jj) {
            ii = RR.length - 1;
            while (0 <= ii) {
                cnt = (RR.length * jj) + ii + 1;
                buf = xor(AA, uint64be(cnt));
                buf = Buffer.concat([
                    buf, RR[ii], iv
                ]);
                cipher = crypto.createDecipheriv("aes128", key, iv);
                buf = cipher.update(buf);
                AA = buf.slice(0, 8);
                RR[ii] = buf.slice(8, 16);
                ii -= 1;
            }
            jj -= 1;
        }
        if (!crypto.timingSafeEqual(IV, AA)) {
            throw new Error("unwrap failed");
        }
        return Buffer.concat(RR).toString("base64");
    };

    local.assertJsonEqual(
        wrapKey(
            Buffer.from("GawgguFyGrWKav7AX4VKUg", "base64"),
            Buffer.from(jweCek, "base64")
        ),
        "6KB707dM9YTIgHtLvtgWQ8mKwboJW3of9locizkDTHzBC2IlrT1oOQ"
    );
    local.assertJsonEqual(
        unwrapKey(
            Buffer.from("GawgguFyGrWKav7AX4VKUg", "base64"),
            Buffer.from(
                "6KB707dM9YTIgHtLvtgWQ8mKwboJW3of9locizkDTHzBC2IlrT1oOQ",
                "base64"
            )
        ),
        "BNMfxVSd/P4LZJ36P6pqzmt81C1vawnbyLEA8I+cLM8="
    );

    // encrypt
    //!! let cipher;
    //!! let decipher;
    //!! let decrypted;
    //!! let encrypted;
    //!! let iv;
    //!! let plaintext;
    //!! key = Buffer.from(jweKeySymmetric.k, "base64");
    //!! iv = Buffer.from("AxY8DCtDaGlsbGljb3RoZQ", "base64");
    //!! plaintext = jweCek;

    //!! cipher = local.crypto.createCipheriv("aes-128-cbc", key, iv);
    //!! //!! encrypted = cipher.update("hello world", "utf8", "base64");
    //!! encrypted = cipher.update(
        //!! plaintext,
        //!! "base64",
        //!! "base64"
    //!! );
    //!! encrypted += cipher.final("base64");
    //!! console.log(encrypted);

    //!! // decrypt
    //!! let buf;
    //!! buf = Buffer.from(
        //!! "6KB707dM9YTIgHtLvtgWQ8mKwboJW3of9locizkDTHzBC2IlrT1oOQ",
        //!! "base64"
    //!! );
    //!! iv = buf.slice(0, 16);
    //!! encrypted = buf.slice(16).toString("base64");
    //!! decipher = local.crypto.createDecipheriv("aes-128-cbc", key, iv);
    //!! //!! decipher.setAuthTag(cipher.getAuthTag());
    //!! decrypted = decipher.update(encrypted, "base64", "utf8");
    //!! decrypted += decipher.final("utf8");
    //!! console.log(decrypted); // 'hello, world'
    onError(undefined, opt);
};

local.testCase_jose_default(undefined, local.onErrorDefault);
}());
}());
