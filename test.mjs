import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from './public/estimate.mjs';
test('標準洗面台・撤去・床4㎡の税額と合計',()=>{const x=calculate([{id:'washbasin',quantity:1},{id:'removal',quantity:1},{id:'floor',quantity:4}]);assert.equal(x.subtotal,115000);assert.equal(x.tax,11500);assert.equal(x.total,126500);assert.equal(x.incomplete,false);});
test('数量未確認は金額に含めない',()=>{const x=calculate([{id:'wall',quantity:null},{id:'floor',quantity:4}]);assert.equal(x.total,19800);assert.equal(x.incomplete,true);});
test('未知の項目と不正な数量は拒否',()=>{assert.throws(()=>calculate([{id:'invented',quantity:1}]));for(const quantity of [-1,0,Infinity,'4',10001])assert.throws(()=>calculate([{id:'floor',quantity}]));});
