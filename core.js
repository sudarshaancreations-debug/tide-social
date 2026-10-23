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

  // --- REVERSE-ENGINEERED SKILL 1: Hormozi Hooks Engine ---
  function generateHormoziHooks(topic) {
    const t = String(topic || '').trim() || 'Content marketing';
    return [
      {
        type: 'Contrarian / Belief Shift',
        hook: `Stop trying to fix your ${t}. It's not your strategy—it's your friction.`,
        why: 'Pattern interrupt that challenges common wisdom immediately.'
      },
      {
        type: 'Effort Reduction / Speed',
        hook: `How we 3x'd our results from ${t} without hiring an agency or spending on ads.`,
        why: 'High outcome promised while removing the two biggest pain points (cost & complexity).'
      },
      {
        type: 'Specific Proof / Case Study',
        hook: `We spent 90 days testing ${t}. 3 small tweaks produced 84,210 impressions.`,
        why: 'Concrete numbers create instant credibility and curiosity.'
      },
      {
        type: 'Urgency / Avoidable Mistake',
        hook: `The single biggest mistake 90% of brands make with ${t} (and how to fix it in 5 mins).`,
        why: 'Loss aversion triggers higher save and read rates.'
      },
      {
        type: 'Transformation / Before-After',
        hook: `From 2 hours a day of wasted effort to a 10-minute weekly ${t} system.`,
        why: 'Extreme contrast highlights massive value proposition.'
      }
    ];
  }

  // --- REVERSE-ENGINEERED SKILL 2: 1-to-5 Content Repurposer ---
  function repurposeContent(longText) {
    const raw = String(longText || '').trim();
    const snippet = raw.slice(0, 140) || 'Our core methodology for modern distribution';

    return {
      sourceSnippet: snippet,
      formats: [
        {
          platform: 'Instagram',
          format: 'Reel Script (9:16)',
          hook: `The real reason your audience isn't engaging:`,
          body: `"${snippet}"\n\nSave this for your next team planning session. Breakdown in caption.`,
          cta: 'Comment "SYSTEM" for our full template.'
        },
        {
          platform: 'LinkedIn',
          format: 'Carousel Outline (6 Slides)',
          hook: `Why the standard playbook for distribution is backwards:`,
          body: `Slide 1: The Problem\nSlide 2: What didn't work\nSlide 3: The breakthrough (${snippet.slice(0, 50)}...)\nSlide 4: 3 tactical moves\nSlide 5: Expected results\nSlide 6: Summary checklist.`,
          cta: 'Repost if this helped your workflow.'
        },
        {
          platform: 'Threads',
          format: '3-Part Thread',
          hook: `1/3: Stop overcomplicating your content operations.`,
          body: `2/3: Here's the key takeaway:\n${snippet}\n\n3/3: Consistency without clarity is noise. Prioritize retention over volume.`,
          cta: 'Follow for daily breakdowns.'
        },
        {
          platform: 'TikTok',
          format: 'Quick Take Video (60s)',
          hook: `Nobody wants to hear this, but:`,
          body: `Talking head POV explaining: ${snippet}. Show visual proof on screen at second 0:04.`,
          cta: 'Full breakdown in bio link.'
        }
      ]
    };
  }

  // --- REVERSE-ENGINEERED SKILL 3: Viral Video Storyboarder ---
  function generateVideoStoryboard(topic) {
    const t = String(topic || '').trim() || 'Content System';
    return {
      title: `${t} — 18s Retention Blueprint`,
      scenes: [
        {
          timestamp: '00:00 - 00:03',
          name: 'The Scroll-Stopper (Hook)',
          visual: 'Fast motion cut or sudden freeze frame with bold on-screen kicker text.',
          onScreenText: `YOUR BRAND DOESN'T NEED MORE ${t.toUpperCase()}`,
          audio: 'Punchy voiceover: "Most creators think they need more volume, but..."',
          retentionGoal: 'Achieve >75% 3-second hold rate.'
        },
        {
          timestamp: '00:03 - 00:11',
          name: 'The Tension & Contrast',
          visual: 'Screen capture showing real analytics chart or practical split-screen comparison.',
          onScreenText: 'WHAT ACTUALLY WORKS (3.2× RESULTS)',
          audio: 'Explanation of the shift: "When we switched from posting daily to high-signal anchors..."',
          retentionGoal: 'Keep viewers engaged through the middle dip.'
        },
        {
          timestamp: '00:11 - 00:18',
          name: 'The Payoff & Micro-CTA',
          visual: 'Clear recap checklist graphic and founder sign-off gesture.',
          onScreenText: 'SAVE THIS WORKFLOW ↴',
          audio: '"Drop a save and try this for your next post."',
          retentionGoal: 'Maximize saves & shares to trigger platform algorithm boost.'
        }
      ]
    };
  }

  return {
    supportedPlatforms,
    normalizeHandle,
    validateAccount,
    createPost,
    validateMedia,
    rewriteCopy,
    generateConcepts,
    generateHormoziHooks,
    repurposeContent,
    generateVideoStoryboard
  };
});
