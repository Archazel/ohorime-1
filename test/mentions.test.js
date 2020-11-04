'use strict';

function parseMention(str) {
  const mentions = [
    {tag: 'nickname', reg: /<@!(\w{1,20})>/},
    {tag: 'channel', reg: /<#(\w{1,20})>/},
    {tag: 'username', reg: /<@(\w{1,20})>/},
    {tag: 'role', reg: /<@&(\w{1,20})>/},
    {tag: 'emoji', reg: /<(:a:)?:(\w{1,20}):(\w{1,20})>/},
  ];

  let matchs = {};

  for (const mention of mentions) {
    if (!matchs[mention.tag]) matchs[mention.tag] = [];
    matchs[mention.tag].push(...str.match(mention.reg));
  };
  
  return matchs;
};

const msg = '<@!363603951163015168>  <#771749195673632819> <@499932143611412493> <@&705542638534918285> <:kappa:718930556997468170>';

console.log(parseMention(msg));