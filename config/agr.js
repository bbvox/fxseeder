module.exports = (function () {
    'use strict';
    var _env, _cfg = {}, _destinationCollections, _sourceCollections, _pairs, _pairs22, _rateSchema, _errors = {};

    // toDO merge in one CONFIG ....

    //1s = 1000 mS
    //1m = 60000 mS
    //15m = 900000 mS (1000 * 60 * 15)
    // 1h = 3600000 mS (15m * 4)
    const _periods = {
        "15m": 900000,
        "1h": 3600000,
        "4h": 14400000,
        "1d": 86400000,
        "1w": 604800000
    };

    _env = process.env.NODE_ENV || "dev";

    _pairs = {
        'EUR/USD': 0,
        'USD/JPY': 1,
        'GBP/USD': 2,
        'EUR/GBP': 3,
        'USD/CHF': 4,
        'EUR/JPY': 5,
        'EUR/CHF': 6,
        'USD/CAD': 7,
        'AUD/USD': 8,
        'GBP/JPY': 9
    }

    _destinationCollections = {
        '5m': 'rates5m',
        '15m': 'rates15m',
        '1h': 'rates1h',
        '4h': 'rates4h',
        '1d': 'rates1d',
        '1w': 'rates1w',
        'base': 'rates1' //remove this in production
    };

    _sourceCollections = {
        '15m': 'rates',
        '1h': 'rates15m',
        '4h': 'rates1h',
        '1d': 'rates4h',
        '1w': 'rates1d'
    };

    _pairs22 = {
        'eurusd': 0,
        'usdjpy': 1,
        'gbpusd': 2,
        'eurgbp': 3,
        'usdchf': 4,
        'eurjpy': 5,
        'eurchf': 6,
        'usdcad': 7,
        'audusd': 8,
        'gbpjpy': 9
    };

    // required fields ...
    const req = {
        str: { type: String, required: true },
        num: { type: Number, required: true }
    }

    _rateSchema = {
        pairId: { type: Number, max: 200 },
        pairName: req.str,
        open: req.num,
        high: req.num,
        close: req.num,
        low: req.num,
        // period: req.num,
        published: { type: Date, default: Date.now }
    };


    _errors = {
        wrongType: "Wrong type",
        wrongPair: "Wrong pair.",
        wrongOffset: "Wrong number."
    };

    //DEVELOPMENT
    _cfg.dev = {
        label: "development",
        mongodb: {
            connect: "mongodb://localhost/fxlines",
            source: _sourceCollections,
            destination: _destinationCollections,
            base: "rates15m",
            limit: 20,
            rateSchema: _rateSchema
        },
        port: process.env.PORT || "3000",
        version: '0.0.1',
        pairs: _pairs,
        errors: _errors,
        periods: _periods,
        diffMs: 600000, // 10m
        dev: true
    };

    //PRODUCTION
    _cfg.prod = {
        label: "production",
        mongodb: "mongodb://localhost/fxlines",
        port: process.env.PORT || "3333",
        version: '0.0.1',
        pairs: _pairs,
        dev: false
    };

    return _cfg[_env] || _cfg.dev;
})();