// usr/bin/env node
/*
 * lib.jose_lite.js (2019.10.22)
 * https://github.com/kaizhu256/node-jose-lite
 * this zero-dependency package will provide a standalone solution to encrypt/decrypt json-web-tokens
 *
 */



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



(function (local) {
"use strict";



/* istanbul ignore next */
// run shared js-env code - init-before
(function () {
// init local
local = (
    globalThis.utility2_rollup
    // || globalThis.utility2_rollup_old
    // || require("./assets.utility2.rollup.js")
    || globalThis.globalLocal
);
// init exports
if (local.isBrowser) {
    globalThis.utility2_jose_lite = local;
} else {
    module.exports = local;
    module.exports.__dirname = __dirname;
}
// init lib main
local.jose_lite = local;



/* validateLineSortedReset */
// run shared js-env code - function
(function () {
local.base64FromBuffer = function (buf) {
/*
 * this function will convert Uint8Array <buf> to base64 str
 */
    let ii;
    let mod3;
    let str;
    let uint24;
    let uint6ToB64;
    // convert utf8 to Uint8Array
    if (typeof buf === "string") {
        buf = new TextEncoder().encode(buf);
    }
    buf = buf || [];
    str = "";
    uint24 = 0;
    uint6ToB64 = function (uint6) {
        return (
            uint6 < 26
            ? uint6 + 65
            : uint6 < 52
            ? uint6 + 71
            : uint6 < 62
            ? uint6 - 4
            : uint6 === 62
            ? 43
            : 47
        );
    };
    ii = 0;
    while (ii < buf.length) {
        mod3 = ii % 3;
        uint24 |= buf[ii] << (16 >>> mod3 & 24);
        if (mod3 === 2 || buf.length - ii === 1) {
            str += String.fromCharCode(
                uint6ToB64(uint24 >>> 18 & 63),
                uint6ToB64(uint24 >>> 12 & 63),
                uint6ToB64(uint24 >>> 6 & 63),
                uint6ToB64(uint24 & 63)
            );
            uint24 = 0;
        }
        ii += 1;
    }
    return str.replace((
        /A(?=A$|$)/gm
    ), "");
};

local.base64ToBuffer = function (str) {
/*
 * this function will convert base64 <str> to Uint8Array
 * https://gist.github.com/wang-bin/7332335
 */
    let buf;
    let byte;
    let chr;
    let ii;
    let jj;
    let map64;
    let mod4;
    str = str || "";
    buf = new Uint8Array(str.length); // 3/4
    byte = 0;
    jj = 0;
    map64 = (
        !(str.indexOf("-") === -1 && str.indexOf("_") === -1)
        // base64url
        ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        // base64
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    );
    mod4 = 0;
    ii = 0;
    while (ii < str.length) {
        chr = map64.indexOf(str[ii]);
        if (chr !== -1) {
            mod4 %= 4;
            if (mod4 === 0) {
                byte = chr;
            } else {
                byte = byte * 64 + chr;
                buf[jj] = 255 & (byte >> ((-2 * (mod4 + 1)) & 6));
                jj += 1;
            }
            mod4 += 1;
        }
        ii += 1;
    }
    // optimization - create resized-view of buf
    return buf.subarray(0, jj);
};

local.bufferConcat = function (bufList) {
/*
 * this function will emulate in browser, node's Buffer.concat
 */
    let byteLength;
    let ii;
    let isString;
    let jj;
    let result;
    isString = true;
    result = [
        ""
    ];
    byteLength = 0;
    bufList.forEach(function (buf) {
        if (buf !== 0 && !(buf && buf.length)) {
            return;
        }
        // optimization - concat string
        if (isString && typeof buf === "string") {
            result[0] += buf;
            return;
        }
        isString = null;
        buf = local.bufferValidateAndCoerce(buf);
        byteLength += buf.byteLength;
        result.push(buf);
    });
    // optimization - return string
    if (isString) {
        return result[0];
    }
    result[0] = local.bufferValidateAndCoerce(result[0]);
    byteLength += result[0].byteLength;
    bufList = result;
    result = local.bufferValidateAndCoerce(new Uint8Array(byteLength));
    ii = 0;
    bufList.forEach(function (buf) {
        jj = 0;
        while (jj < buf.byteLength) {
            result[ii] = buf[jj];
            ii += 1;
            jj += 1;
        }
    });
    return result;
};

local.bufferValidateAndCoerce = function (buf, mode) {
/*
 * this function will validate and coerce/convert
 * <buf> to Buffer/Uint8Array, or String if <mode> = "string"
 */
    // validate not 0
    if (buf !== 0) {
        buf = buf || "";
    }
    if (typeof buf === "string" && mode === "string") {
        return buf;
    }
    // convert utf8 to Uint8Array
    if (typeof buf === "string") {
        buf = new TextEncoder().encode(buf);
    // validate instanceof Uint8Array
    } else if (Object.prototype.toString.call(buf) !== "[object Uint8Array]") {
        throw new Error(
            "bufferValidateAndCoerce - value is not instanceof "
            + "ArrayBuffer, String, or Uint8Array"
        );
    }
    // convert Uint8Array to utf8
    if (mode === "string") {
        return new TextDecoder().decode(buf);
    }
    // coerce Uint8Array to Buffer
    if (globalThis.Buffer && Buffer.isBuffer && !Buffer.isBuffer(buf)) {
        Object.setPrototypeOf(buf, Buffer.prototype);
    }
    return buf;
};

local.cryptoEncryptAes128cbc = async function (opt) {
/*
 * this function will encrypt / decrypt <opt>.dataDecrypted,
 * using aes-128-cbc
 */
    let crypto;
    let tmp;
    // encode data
    if (typeof opt.data === "string") {
        opt.data = new TextEncoder().encode(opt.data);
    }
    crypto = (
        (globalThis.crypto && globalThis.crypto.subtle)
        ? globalThis.crypto
        : require("crypto")
    );
    tmp = (
        (crypto.subtle && opt.mode === "decrypt")
        ? crypto.subtle.decrypt.bind(crypto.subtle)
        : crypto.subtle
        ? crypto.subtle.encrypt.bind(crypto.subtle)
        : opt.mode === "decrypt"
        ? crypto.createDecipheriv
        : crypto.createCipheriv
    );
    if (crypto.subtle) {
        opt.key = await crypto.subtle.importKey("raw", opt.key, {
            name: "AES-CBC"
        }, false, [
            "decrypt", "encrypt"
        ]);
        tmp = await tmp({
            iv: opt.iv,
            name: "AES-CBC"
        }, opt.key, opt.data);
        tmp = new Uint8Array(tmp);
    } else {
        tmp = tmp("aes-128-cbc", opt.key, opt.iv);
        tmp = Buffer.concat([
            tmp.update(opt.data), tmp.final()
        ]);
    }
    return tmp;
};

local.cryptoRandomBuffer = function (nn) {
/*
 * this function will return random buf with length <nn>
 */
    return (
        (globalThis.crypto && globalThis.crypto.subtle)
        ? globalThis.crypto.getRandomValues(new Uint8Array(nn))
        : require("crypto").randomBytes(nn)
    );
};

local.jweDecrypt = async function (opt) {
/*
 * this function will jwe-decrypt <opt>.jweEncrypted,
 * using aes-key-wrap and aes_128_cbc_hmac_sha_256
 */
    opt.mode = "decrypt";
    return local.jweEncrypt(opt);
};

local.jweEncrypt = async function (opt) {
/*
 * this function will jwe-encrypt <opt>.dataDecrypted,
 * using aes-key-wrap and aes_128_cbc_hmac_sha_256
 */
    let base64urlFromBuffer;
    let base64urlToBuffer;
    let tmp;
    base64urlFromBuffer = function (buf) {
    /*
     * this function will convert Uint8Array <buf> to base64url str
     */
        return (
            typeof buf === "string"
            ? buf
            : local.base64FromBuffer(buf).replace((
                /\//g
            ), "_").replace((
                /\=/g
            ), "")
        );
    };
    base64urlToBuffer = function (str) {
    /*
     * this function will convert base64url <str> to Uint8Array
     */
        return (
            (
                typeof str.byteLength === "number"
                || str.constructor.name === "CryptoKey"
            )
            ? str
            : local.base64ToBuffer(str)
        );
    };
    opt.kek = base64urlToBuffer(opt.kek || local.cryptoRandomBuffer(16));
    opt.kek = await local.jweImportKeyRaw(opt.kek, {
        name: "AES-KW"
    }, false, [
        "unwrapKey", "wrapKey"
    ]);
    // {"alg":"A128KW","enc":"A128CBC-HS256"}
    opt.header = "eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0";
    switch (opt.mode) {
    case "decrypt":
    case "validate":
        tmp = opt.jweEncrypted.split(".");
        opt.cekWrapped = tmp[1];
        opt.iv = base64urlToBuffer(tmp[2]);
        opt.dataEncrypted = base64urlToBuffer(tmp[3]);
        opt.sig = tmp[4];
        // unwrap cekWrapped
        opt.cek = base64urlToBuffer(
            opt.cek
            || await local.jweWrapKey({
                cek: base64urlToBuffer(opt.cekWrapped),
                kek: opt.kek,
                mode: "decrypt"
            })
        );
        // validate sig
        tmp = await local.jweSign({
            cek: opt.cek,
            data: opt.dataEncrypted,
            header: opt.header,
            iv: opt.iv
        });
        tmp = base64urlFromBuffer(tmp);
        local.assertOrThrow(tmp === opt.sig, "invalid signature");
        if (opt.mode === "validate") {
            return;
        }
        // decrypt dataEncrypted
        opt.dataDecrypted = await local.cryptoEncryptAes128cbc({
            data: opt.dataEncrypted,
            iv: opt.iv,
            key: opt.cek.slice(16),
            mode: "decrypt"
        });
        opt.dataDecrypted = new TextDecoder().decode(opt.dataDecrypted);
        return opt.dataDecrypted;
    // encrypt
    default:
        opt.cek = base64urlToBuffer(opt.cek || local.cryptoRandomBuffer(32));
        opt.iv = base64urlToBuffer(opt.iv || local.cryptoRandomBuffer(16));
        // wrap cek
        opt.cekWrapped = base64urlFromBuffer(
            opt.cekWrapped
            || await local.jweWrapKey({
                cek: opt.cek,
                kek: opt.kek
            })
        );
        // encrypt dataDecrypted
        opt.dataEncrypted = await local.cryptoEncryptAes128cbc({
            data: opt.dataDecrypted,
            iv: opt.iv,
            key: opt.cek.slice(16)
        });
        // init sig
        opt.sig = await local.jweSign({
            cek: opt.cek,
            data: opt.dataEncrypted,
            header: opt.header,
            iv: opt.iv
        });
        opt.sig = base64urlFromBuffer(opt.sig);
        opt.jweEncrypted = (
            opt.header + "."
            + opt.cekWrapped + "."
            + base64urlFromBuffer(opt.iv) + "."
            + base64urlFromBuffer(opt.dataEncrypted) + "."
            + opt.sig
        );
        return opt.jweEncrypted;
    }
};

local.jweImportKeyRaw = async function (key, alg, ext, key_ops) {
/*
 * this function will import raw <key>
 */
    let subtle;
    subtle = globalThis.crypto && globalThis.crypto.subtle;
    if (subtle && key.constructor.name !== "CryptoKey") {
        return await subtle.importKey("raw", key, alg, ext, key_ops);
    }
    return key;
};

local.jweSign = async function (opt) {
/*
 * this function will jwe-sign <opt>.jweEncrypted,
 * using aes_128_cbc_hmac_sha_256
 */
    let crypto;
    let data;
    let ii;
    let jj;
    let tmp;
    // init data
    tmp = new TextEncoder().encode(opt.header);
    data = new Uint8Array(
        tmp.length + opt.iv.length + opt.data.length + 8
    );
    ii = 0;
    [
        tmp, opt.iv, opt.data, [
            0,
            0,
            0,
            0,
            (tmp.length >>> 21) & 0xff,
            (tmp.length >> 13) & 0xff,
            (tmp.length >> 5) & 0xff,
            (8 * tmp.length) & 0xff
        ]
    ].forEach(function (elem) {
        jj = 0;
        while (jj < elem.length) {
            data[ii] = elem[jj];
            ii += 1;
            jj += 1;
        }
    });
    crypto = (
        (globalThis.crypto && globalThis.crypto.subtle)
        ? globalThis.crypto
        : require("crypto")
    );
    if (crypto.subtle) {
        tmp = await crypto.subtle.importKey("raw", opt.cek.slice(0, 16), {
            hash: "SHA-256",
            name: "HMAC"
        }, false, [
            "sign"
        ]);
        tmp = new Uint8Array(await crypto.subtle.sign({
            name: "HMAC"
        }, tmp, data));
    } else {
        tmp = crypto.createHmac(
            "sha256",
            opt.cek.slice(0, 16)
        ).update(data).digest();
    }
    return tmp.slice(0, 16);
};

local.jweWrapKey = async function (opt) {
/*
 * this function will wrap/unwrap <opt>.cek with given symmetric <opt>.kek
 * https://tools.ietf.org/html/rfc7516#appendix-A.3.3
 */
    let AA;
    let BB;
    let KK;
    let RR;
    let crypto;
    let ii;
    let iv;
    let jj;
    let loop;
    let nn;
    let tt;
    // init var
    AA = new Uint8Array(32);
    KK = opt.kek;
    RR = opt.cek;
    ii = 0;
    iv = new Uint8Array(16);
    nn = 4;
    crypto = (
        (globalThis.crypto && globalThis.crypto.subtle)
        ? globalThis.crypto
        : require("crypto")
    );
    // use crypto.subtle
    if (crypto.subtle) {
        if (opt.mode === "decrypt") {
            RR = await crypto.subtle.unwrapKey("raw", RR, KK, {
                name: "AES-KW"
            }, {
                name: "AES-CBC"
            }, true, [
                "decrypt", "encrypt"
            ]);
            RR = await crypto.subtle.exportKey("raw", RR);
        } else {
            RR = await crypto.subtle.importKey("raw", RR, {
                name: "AES-CBC"
            }, true, [
                "decrypt", "encrypt"
            ]);
            RR = await crypto.subtle.wrapKey("raw", RR, KK, "AES-KW");
        }
        return new Uint8Array(RR);
    }
    crypto = (
        opt.mode === "decrypt"
        ? crypto.createDecipheriv
        : crypto.createCipheriv
    );
    // init loop
    loop = async function () {
        // AA xor tt
        if (opt.mode === "decrypt") {
            tt = nn * jj + ii;
            AA[4] ^= ((tt >>> 24) & 0xff);
            AA[5] ^= ((tt >> 16) & 0xff);
            AA[6] ^= ((tt >> 8) & 0xff);
            AA[7] ^= (tt & 0xff);
        }
        // init RR
        AA[8] = RR[8 * ii];
        AA[9] = RR[8 * ii + 1];
        AA[10] = RR[8 * ii + 2];
        AA[11] = RR[8 * ii + 3];
        AA[12] = RR[8 * ii + 4];
        AA[13] = RR[8 * ii + 5];
        AA[14] = RR[8 * ii + 6];
        AA[15] = RR[8 * ii + 7];
        // encrypt / decrypt RR
        BB = crypto("aes-128-cbc", KK, iv);
        BB.setAutoPadding(false);
        BB = Buffer.concat([
            BB.update(AA), BB.final()
        ]);
        // update RR
        AA[0] = BB[0];
        AA[1] = BB[1];
        AA[2] = BB[2];
        AA[3] = BB[3];
        AA[4] = BB[4];
        AA[5] = BB[5];
        AA[6] = BB[6];
        AA[7] = BB[7];
        RR[8 * ii + 0] = BB[8];
        RR[8 * ii + 1] = BB[9];
        RR[8 * ii + 2] = BB[10];
        RR[8 * ii + 3] = BB[11];
        RR[8 * ii + 4] = BB[12];
        RR[8 * ii + 5] = BB[13];
        RR[8 * ii + 6] = BB[14];
        RR[8 * ii + 7] = BB[15];
        // AA xor tt
        if (opt.mode !== "decrypt") {
            tt = nn * jj + ii;
            AA[4] ^= ((tt >>> 24) & 0xff);
            AA[5] ^= ((tt >> 16) & 0xff);
            AA[6] ^= ((tt >> 8) & 0xff);
            AA[7] ^= (tt & 0xff);
        }
    };
    /*
        2.2.2 Key Unwrap
        https://tools.ietf.org/html/rfc3394#section-2.2.2
        Inputs: Ciphertext, (n+1) 64-bit values {C0, C1, ..., Cn}, and
            Key, K (the KEK).
        Outputs: Plaintext, n 64-bit values {P0, P1, K, Pn}.
        1) Initialize variables.
            Set A = C[0]
            For i = 1 to n
                R[i] = C[i]
        2) Compute intermediate values.
            For j = 5 to 0
                For i = n to 1
                    B = AES-1(K, (A ^ t) | R[i]) where t = n*j+i
                    A = MSB(64, B)
                    R[i] = LSB(64, B)
        3) Output results.
            For i = 1 to n
                P[i] = R[i]
    */
    if (opt.mode === "decrypt") {
        AA[0] = RR[0];
        AA[1] = RR[1];
        AA[2] = RR[2];
        AA[3] = RR[3];
        AA[4] = RR[4];
        AA[5] = RR[5];
        AA[6] = RR[6];
        AA[7] = RR[7];
        jj = 5;
        while (0 <= jj) {
            ii = nn;
            while (1 <= ii) {
                await loop();
                ii -= 1;
            }
            jj -= 1;
        }
        return RR.slice(8);
    }
    /*
        2.2.1 Key Wrap
        https://tools.ietf.org/html/rfc3394#section-2.2.1
        Inputs: Plaintext, n 64-bit values {P1, P2, ..., Pn}, and
            Key, K (the KEK).
        Outputs: Ciphertext, (n+1) 64-bit values {C0, C1, ..., Cn}.
        1) Initialize variables.
            Set A = IV, an initial value (see 2.2.3)
            For i = 1 to n
                R[i] = P[i]
        2) Calculate intermediate values.
            For j = 0 to 5
                For i = 1 to n
                    B = AES(K, A | R[i])
                    A = MSB(64, B) ^ t where t = (n*j)+i
                    R[i] = LSB(64, B)
        3) Output the results.
            Set C[0] = A
            For i = 1 to n
                C[i] = R[i]
    */
    BB = RR;
    RR = new Uint8Array(BB.length + 8);
    ii = 0;
    while (ii < BB.length) {
        RR[ii + 8] = BB[ii];
        ii += 1;
    }
    AA[0] = 0xa6;
    AA[1] = 0xa6;
    AA[2] = 0xa6;
    AA[3] = 0xa6;
    AA[4] = 0xa6;
    AA[5] = 0xa6;
    AA[6] = 0xa6;
    AA[7] = 0xa6;
    jj = 0;
    while (jj <= 5) {
        ii = 1;
        while (ii <= nn) {
            await loop();
            ii += 1;
        }
        jj += 1;
    }
    RR[0] = AA[0];
    RR[1] = AA[1];
    RR[2] = AA[2];
    RR[3] = AA[3];
    RR[4] = AA[4];
    RR[5] = AA[5];
    RR[6] = AA[6];
    RR[7] = AA[7];
    return RR;
};
}());
}());
}());
