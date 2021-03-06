
import test from 'tape';

import * as FUNCTIONS from '../src/functions';

test("functions: guid", assert => {
    const one = FUNCTIONS.guid();
    const two = FUNCTIONS.guid();
    
    assert.equals(one.length, 36);
    assert.equals(two.length, 36);
    assert.notEquals(one, two);
    
    assert.end();
});

test("functions: randomInt", assert => {
    const save = Math.random;
    
    Math.random = () => 0;
    const lower = FUNCTIONS.randomInt("100", "200");
    assert.equals(lower, "100");
    
    Math.random = () => 0.5;
    const half = FUNCTIONS.randomInt("100", "200");
    assert.equals(half, "150");
    
    Math.random = () => 1;
    const upper = FUNCTIONS.randomInt("100", "200");
    assert.equals(upper, "200");
    
    assert.end();
    Math.random = save;
});

test("functions: timestamp", assert => {
    const resolution = 1000;
    const now = FUNCTIONS.timestamp();
    
    const actual = (+now / resolution).toFixed(0);
    const expected = (+new Date() / resolution).toFixed(0);
    
    assert.equals(actual, expected);
    assert.end();
});

test("functions: timestamp offset", assert => {
    const resolution = 1000;
    const now = FUNCTIONS.timestamp("1", "h");
    
    const actual = (+now / resolution).toFixed(0);
    const expected = (+new Date() / resolution).toFixed(0);
    
    // @todo Not great.
    assert.notEquals(actual, expected);
    
    assert.end();
});

// @todo datetime

// @todo localDatetime

// @todo processEnv

// @todo dotenv
