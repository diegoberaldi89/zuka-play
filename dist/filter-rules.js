'use strict';
// Shared between the browser and Node tests. Date-only ISO strings avoid timezone shifts.
(function(root){
 const normalized=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const validDistanceRange=(min,max)=>min!==''&&max!==''&&Number.isFinite(Number(min))&&Number.isFinite(Number(max))&&Number(min)>=0&&Number(max)>=Number(min);
 const rules={
  validDistanceRange,
  matchesDistance(distance,min,max){return distance!==null&&Number.isFinite(distance)&&validDistanceRange(min,max)&&distance>=Number(min)&&distance<=Number(max);},
  matchesDateRange(t,start,end){if(start&&end&&start>end)return false;return (!start||t.end>=start)&&(!end||t.start<=end);},
  citiesForState(cities,state,search=''){const term=normalized(search);return cities.filter(c=>(!state||c.state===state)&&(!term||normalized(`${c.name} ${c.state}`).includes(term)));}
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=rules;else root.ZukaFilters=rules;
})(globalThis);
