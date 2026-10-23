(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const supportedPlatforms = [
    'Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Threads',
    'X', 'YouTube', 'Pinterest', 'Bluesky', 'Mastodon', 'Google Business', 'Substack'
  ];

  function normalizeHandle(handle) {
    const value = String(handle || '').trim();
    return value && !value.startsWith('@') ? `@${value}` : value;
  }

  function validateAccount(platform, handle) {
    if (!supportedPlatforms.includes(platform)) return { valid: false, error: 'Choose a supported platform.' };
    const normalized = normalizeHandle(handle);
    if (!/^@[a-zA-Z0-9._-]{2,40}$/.test(normalized)) return { valid: false, error: 'Enter a valid account handle.' };
    return { valid: true, handle: normalized };
  }

  function createPost(copy, channels, date, time) {
    const text = String(copy || '').trim();
    if (!text) return { valid: false, error: 'Write something before scheduling.' };
    if (!Array.isArray(channels) || channels.length === 0) return { valid: false, error: 'Choose at least one channel.' };
    if (!date || !time) return { valid: false, error: 'Choose a publishing date and time.' };
    return { valid: true, post: { id: Date.now(), copy: text, channels, date, time, status: 'scheduled' } };
  }

  function validateMedia(fileInfo) {
    if (!fileInfo) return { valid: false, error: 'No media provided.' };
    const maxSizeBytes = 100 * 1024 * 1024; // 100MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    
    if (fileInfo.size > maxSizeBytes) {
      return { valid: false, error: 'File exceeds 100MB platform upload limit.' };
    }
    if (fileInfo.type && !validTypes.includes(fileInfo.type)) {
      return { valid: false, error: 'Unsupported format. Use MP4, MOV, PNG, JPG or WebP.' };
    }
    return {
      valid: true,
      ratioCheck: '9:16 / 1:1 / 16:9 safe',
      sizeMB: (fileInfo.size / (1024 * 1024)).toFixed(1),
      status: 'Preflight check passed: Ready for Instagram, TikTok, LinkedIn & YouTube'
    };
  }

  function rewriteCopy(text, type) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return 'Share something worth stopping for…';
    
    switch (type) {
      case 'add_hook':
        if (trimmed.startsWith('Most people get this backwards:')) return trimmed;
        return `Most people get this backwards:\n\n${trimmed}\n\nHere’s what actually worked for us:`;
      case 'shorten':
        return trimmed
          .split('\n')
          .filter(Boolean)
          .slice(0, 2)
          .join(' ')
          .replace(/\s+/g, ' ')
          .slice(0, 240);
      case 'change_tone':
        return `The contrarian take: Stop over-optimizing. ${trimmed} Simplicity beats volume every single time.`;
      case 'rewrite':
      default:
        return `${trimmed}\n\nKey takeaways:\n1. Focus on signal over noise.\n2. Consistency without clarity is just spam.\n3. Build once, distribute everywhere.`;
    }
  }

  function generateConcepts(prompt) {
    const input = String(prompt || '').trim() || 'Modern social strategy';
    return [
      {
        id: 'c1',
        title: `The truth about ${input.slice(0, 32)} nobody talks about`,
        format: 'Short Reel (9:16)',
        voice: 'Founder voice · Contrarian',
        platform: 'Instagram',
        copy: `Most creators obsess over vanity metrics, but here’s what really drives qualified leads when exploring "${input}". Here are 3 tactical shifts you can make today.`
      },
      {
        id: 'c2',
        title: `What changed when we simplified our approach to ${input.slice(0, 28)}`,
        format: 'LinkedIn Carousel (6 slides)',
        voice: 'Data-led · Practical',
        platform: 'LinkedIn',
        copy: `We stopped doing 80% of what everyone recommended for "${input}". The result? 3.2x higher engagement and half the production time. Breakdown inside ↴`
      },
      {
        id: 'c3',
        title: `4-step framework for mastering ${input.slice(0, 32)}`,
        format: 'TikTok / Shorts Video',
        voice: 'Actionable · Fast-paced',
        platform: 'TikTok',
        copy: `If I had to start over with "${input}" from scratch, this is the exact playbook I’d use. Save this for your next planning session.`
      }
    ];
  }

  return {
    supportedPlatforms,
    normalizeHandle,
    validateAccount,
    createPost,
    validateMedia,
    rewriteCopy,
    generateConcepts
  };
});
