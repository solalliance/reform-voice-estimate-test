export const catalog = [
  {id:'washbasin', name:'洗面台交換（標準品・施工込）',unit:'台',price:85000},
  {id:'removal', name:'既存洗面台の撤去・処分',unit:'台',price:12000},
  {id:'floor', name:'クッションフロア張り替え',unit:'㎡',price:4500},
  {id:'wall', name:'壁クロス張り替え',unit:'㎡',price:1800}
];
export function calculate(items) {
  if(!Array.isArray(items)||items.length>30) throw new Error('項目数が不正です');
  const rows=items.map(i=>{
    const c=catalog.find(c=>c.id===i.id);
    if(!c) throw new Error('単価表にない項目です');
    const q=i.quantity;
    if(q!==null && (typeof q!=='number'||!Number.isFinite(q)||q<=0||q>10000)) throw new Error('数量が不正です');
    return {...c,quantity:q,amount:q===null?null:Math.round(c.price*q)};
  });
  const subtotal=rows.reduce((a,r)=>a+(r.amount??0),0),tax=Math.floor(subtotal*0.1);
  return {rows,subtotal,tax,total:subtotal+tax,incomplete:rows.some(r=>r.quantity===null)};
}
