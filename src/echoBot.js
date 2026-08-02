// Rule-based echo bot logic (module)
const rules = [
  { type: 'exact', pattern: 'ping', reply: () => 'pong' },
  { type: 'exact', pattern: '안녕', reply: () => '안녕하세요! 무엇을 도와드릴까요?' },

  // prefix rules
  { type: 'prefix', pattern: 'echo:', reply: (msg) => msg.slice(msg.indexOf(':') + 1).trim() },
  { type: 'prefix', pattern: 'reverse:', reply: (msg) => msg.slice(msg.indexOf(':') + 1).trim().split('').reverse().join('') },
  { type: 'prefix', pattern: 'upper:', reply: (msg) => msg.slice(msg.indexOf(':') + 1).trim().toUpperCase() },

  // regex rules
  { type: 'regex', pattern: /^\d+$/, reply: (msg, m) => `숫자 ${m[0]}를 받았습니다.` },
  { type: 'regex', pattern: /^(hi|hello|hey|안녕|안녕하세요)\b/i, reply: () => '안녕하세요! 백업 에코봇이에요.' },
];

function respond(message) {
  const m = (message || '').trim();
  if (!m) return "빈 메시지예요.";

  for (const r of rules) {
    if (r.type === 'exact') {
      if (m === r.pattern) return typeof r.reply === 'function' ? r.reply(m) : r.reply;
    } else if (r.type === 'prefix') {
      if (m.toLowerCase().startsWith(r.pattern.toLowerCase())) {
        return typeof r.reply === 'function' ? r.reply(m) : r.reply;
      }
    } else if (r.type === 'regex') {
      const match = m.match(r.pattern);
      if (match) return typeof r.reply === 'function' ? r.reply(m, match) : r.reply;
    }
  }

  return `에코: ${m}`;
}

module.exports = { respond, rules };
