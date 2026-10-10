// 1. DATA SOURCE
    const creators = [
      { id: 'aarav-sharma', name: 'Aarav Sharma', role: 'AI Filmmaker', rating: 4.8, reviews: 124, projects: 12, tools: ['Runway', 'Midjourney', 'Pika'], image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' },
      { id: 'priya-desai', name: 'Priya Desai', role: 'AI Animator', rating: 4.7, reviews: 98, projects: 9, tools: ['Stable Diffusion', '3D Animation'], image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
      { id: 'rohan-mehta', name: 'Rohan Mehta', role: 'Generative Artist', rating: 4.9, reviews: 100, projects: 24, tools: ['Runway', 'DALL·E', 'Render'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80' },
      { id: 'sneha-iyer', name: 'Sneha Iyer', role: 'AI Filmmaker', rating: 4.6, reviews: 116, projects: 8, tools: ['Runway', 'Pika', 'ComfyUI'], image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' }
    ];

    const projects = [
      { name: 'The Last Horizon', type: 'Sci-fi Short Film', tools: 'Runway, Midjourney', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
      { name: 'Urban Dreams', type: 'Cinematic Fashion Video', tools: 'Pika, Runway', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Neon City 2099', type: 'Music Video Production', tools: 'Midjourney, Pika', image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80' }
    ];

    // 2. NAVIGATION ROUTING
    function navigateTo(pageId) {
      const pages = ['home', 'discover', 'portfolios', 'create-brief', 'assistant'];
      pages.forEach(p => {
        const el = document.getElementById(`page-${p}`);
        const nav = document.getElementById(`nav-${p}`);
        if (el) el.classList.remove('active');
        if (p === 'home') {
          document.getElementById('page-home').style.display = (pageId === 'home') ? 'block' : 'none';
        }
        if (nav) nav.classList.remove('active');
      });

      const activePage = document.getElementById(`page-${pageId}`);
      const activeNav = document.getElementById(`nav-${pageId}`);
      if (activePage && pageId !== 'home') activePage.classList.add('active');
      if (activeNav) activeNav.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. RENDER CARDS
    function createCardHTML(c) {
      return `
        <article class="creator-card">
          <img class="creator-cover" src="${c.image}" alt="${c.name}">
          <div class="creator-body">
            <div class="creator-identity">
              <img class="avatar" src="${c.avatar}" alt="${c.name}">
              <div>
                <div class="creator-name">${c.name} <i data-lucide="badge-check" style="width:14px;color:var(--primary)"></i></div>
                <div class="creator-role">${c.role}</div>
              </div>
            </div>
            <div class="creator-metrics">
              <span>★ ${c.rating} (${c.reviews})</span>
              <span>${c.projects} projects</span>
            </div>
            <div class="tool-tags">
              ${c.tools.map(t => `<span>⊡ ${t}</span>`).join('')}
            </div>
            <button class="btn btn-outline btn-sm" style="width:100%" onclick="openModal('creator-contact', '${c.name}')">View Profile & Hire</button>
          </div>
        </article>
      `;
    }

    function renderFeaturedCreators() {
      const container = document.getElementById('featured-creators-list');
      container.innerHTML = creators.map(createCardHTML).join('');
    }

    function renderDiscoveryCreators() {
      const search = (document.getElementById('discover-search')?.value || '').toLowerCase();
      const roleChecks = Array.from(document.querySelectorAll('input[name="role"]:checked')).map(cb => cb.value);
      const toolChecks = Array.from(document.querySelectorAll('input[name="tool"]:checked')).map(cb => cb.value);

      const filtered = creators.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search) || c.role.toLowerCase().includes(search) || c.tools.some(t => t.toLowerCase().includes(search));
        const matchesRole = roleChecks.length === 0 || roleChecks.includes(c.role);
        const matchesTool = toolChecks.length === 0 || toolChecks.some(t => c.tools.includes(t));
        return matchesSearch && matchesRole && matchesTool;
      });

      const container = document.getElementById('discovery-creators-list');
      container.innerHTML = filtered.length ? filtered.map(createCardHTML).join('') : '<p style="color:var(--text-muted);padding:40px;">No creators match your filters.</p>';
      lucide.createIcons();
    }

    function renderPortfolios() {
      const container = document.getElementById('portfolio-projects-list');
      container.innerHTML = projects.map(p => `
        <div class="creator-card">
          <img class="creator-cover" src="${p.image}" alt="${p.name}">
          <div class="creator-body">
            <h3 style="font-size:16px;font-weight:700;">${p.name}</h3>
            <p style="color:var(--text-muted);font-size:13px;margin:4px 0 12px">${p.type}</p>
            <div class="tool-tags"><span>${p.tools}</span></div>
          </div>
        </div>
      `).join('');
    }

    // 4. QUICK SEARCH & CATEGORY FILTER
    function quickSearch() {
      const term = document.getElementById('home-search').value;
      navigateTo('discover');
      const discInput = document.getElementById('discover-search');
      if (discInput) discInput.value = term;
      renderDiscoveryCreators();
    }

    function filterCategory(cat) {
      navigateTo('discover');
      const discInput = document.getElementById('discover-search');
      if (discInput) discInput.value = cat;
      renderDiscoveryCreators();
    }

    // 5. MODALS (LOGIN, BUSINESS LOGIN, SIGN IN, SIGN UP)
    function openModal(type, extra = '') {
      const overlay = document.getElementById('auth-modal');
      const title = document.getElementById('modal-title');
      const desc = document.getElementById('modal-desc');
      const body = document.getElementById('modal-body');

      if (type === 'login' || type === 'signin') {
        title.innerText = 'Welcome Back';
        desc.innerText = 'Log in to your Kampus.VC creator or client account.';
        body.innerHTML = `
          <div class="form-field"><label>Email address</label><input type="email" placeholder="name@domain.com"></div>
          <div class="form-field"><label>Password</label><input type="password" placeholder="••••••••"></div>
          <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="closeModal();alert('Logged in successfully (Demo)')">Log In</button>
          <div style="text-align:center;margin-top:14px;font-size:12px;color:var(--text-muted);">
            Don't have an account? <a href="javascript:void(0)" onclick="openModal('signup')" style="color:var(--primary);font-weight:700;">Sign up</a>
          </div>
        `;
      } else if (type === 'business') {
        title.innerText = 'Business & Agency Portal';
        desc.innerText = 'Sign in with your enterprise credentials to hire creators and manage briefs.';
        body.innerHTML = `
          <div class="form-field"><label>Work Email</label><input type="email" placeholder="alex@company.com"></div>
          <div class="form-field"><label>Company Domain / SSO</label><input type="text" placeholder="acme.com"></div>
          <div class="form-field"><label>Password</label><input type="password" placeholder="••••••••"></div>
          <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="closeModal();alert('Business Portal accessed (Demo)')">Access Business Portal</button>
        `;
      } else if (type === 'signup') {
        title.innerText = 'Create an Account';
        desc.innerText = 'Join the leading verified generative AI creator marketplace.';
        body.innerHTML = `
          <div class="form-field"><label>Full Name</label><input type="text" placeholder="Alex Morgan"></div>
          <div class="form-field"><label>Email</label><input type="email" placeholder="alex@example.com"></div>
          <div class="form-field"><label>I am joining as</label>
            <select>
              <option>AI Creator (Filmmaker / Artist / Designer)</option>
              <option>Brand / Agency (Hiring talent)</option>
            </select>
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="closeModal();alert('Account created! Welcome to Kampus.VC (Demo)')">Create Account</button>
        `;
      } else if (type === 'creator-contact') {
        title.innerText = `Work with ${extra}`;
        desc.innerText = `Send a direct campaign proposal or hire request.`;
        body.innerHTML = `
          <div class="form-field"><label>Your Name / Brand</label><input type="text" placeholder="Acme Studio"></div>
          <div class="form-field"><label>Campaign Brief Summary</label><textarea placeholder="Tell ${extra} what you need..."></textarea></div>
          <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="closeModal();alert('Proposal sent to ' + '${extra}' + '!')">Send Proposal</button>
        `;
      }

      overlay.classList.add('active');
      lucide.createIcons();
    }

    function closeModal() {
      document.getElementById('auth-modal').classList.remove('active');
    }

    // 6. BRIEF SUBMISSION
    function submitBrief(e) {
      e.preventDefault();
      const title = document.getElementById('b-title').value;
      const brand = document.getElementById('b-brand').value;
      alert(`Success! Campaign brief "${title}" for ${brand} has been submitted.`);
      document.getElementById('brief-form').reset();
      navigateTo('discover');
    }

    // 7. AI ASSISTANT CHAT
    function sendChatPrompt(prompt) {
      document.getElementById('chat-user-input').value = prompt;
      handleChatSubmit(new Event('submit'));
    }

    function handleChatSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('chat-user-input');
      const text = input.value.trim();
      if (!text) return;

      const stream = document.getElementById('chat-stream');
      stream.innerHTML += `<div class="chat-bubble user">${text}</div>`;
      input.value = '';

      setTimeout(() => {
        let reply = "I can help connect you with verified creators! Check out Aarav Sharma for cinematic films or Priya Desai for 3D animation.";
        if (/brief|campaign/i.test(text)) {
          reply = "To start a campaign, define your visual style, aspect ratio (16:9 for YouTube/Cinema, 9:16 for Social), and deadline in the 'Create Brief' page!";
        } else if (/tool|model/i.test(text)) {
          reply = "Our creators specialize in Runway Gen-3, Midjourney v6, Stable Diffusion XL, ComfyUI, and Pika Labs.";
        }
        stream.innerHTML += `<div class="chat-bubble">${reply}</div>`;
        stream.scrollTop = stream.scrollHeight;
        lucide.createIcons();
      }, 500);

      stream.scrollTop = stream.scrollHeight;
    }

    // INITIALIZATION
    window.addEventListener('DOMContentLoaded', () => {
      renderFeaturedCreators();
      renderDiscoveryCreators();
      renderPortfolios();
      lucide.createIcons();
    });
