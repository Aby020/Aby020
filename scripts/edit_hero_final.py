import re

def edit_svg(variant):
    path = f'assets/hero/agent-console-a5f49893-{variant}.svg'
    with open(path, 'r', encoding='utf-8') as f:
        svg = f.read()

    is_dark = 'dark' in variant
    is_mobile = 'mobile' in variant
    text_fill = '#8b949e' if is_dark else '#59636e'
    prompt_fill = '#7ee787' if is_dark else '#1a7f37'
    cmd_fill = '#c9d1d9' if is_dark else '#1f2328'
    cursor_fill = '#7ee787' if is_dark else '#1a7f37'
    accent = '#79c0ff'

    # --- 1. PROFILE SUMMARY (resume-aligned) ---
    svg = svg.replace(
        '>Backend Engineer focused on building scalable REST APIs and full-stack web</text>',
        f'><tspan fill="{accent}">MCA graduate</tspan> targeting <tspan fill="{accent}">Python Developer</tspan> roles with hands-on experience building</text>'
    )
    svg = svg.replace(
        '>applications with Python, Django, Django REST Framework, and PostgreSQL —</text>',
        '>backend applications using <tspan fill="#7ee787">Python</tspan>, <tspan fill="#7ee787">Django</tspan>, <tspan fill="#7ee787">REST APIs</tspan>, and <tspan fill="#7ee787">PostgreSQL</tspan> —</text>'
    )
    svg = svg.replace(
        '>and AI-powered systems with LLMs (RAG, MCP).</text>',
        '>database-driven applications, APIs, authentication, testing, and deployment.</text>'
    )

    # --- 2. FIX DUPLICATE + TRUSTFUND PLACEMENT ---
    # Remove duplicate "cat current-projects.md" + standalone TrustFund (theme-aware)
    dup_pattern = (
        f'<g clip-path="url(#system-line-25)"><text x="528" y="507" class="system-row">'
        f'<tspan class="system-prompt" fill="{prompt_fill}">$</tspan>'
        f'<tspan fill="{text_fill}"> </tspan>'
        f'<tspan class="system-command" fill="{cmd_fill}">cat current-projects.md</tspan></text></g>\n'
        f'<g clip-path="url(#system-line-28)"><text x="546" y="523.5" class="system-row" fill="{text_fill}">'
        f'TrustFund  — Fund Management Platform</text></g>\n'
    )
    svg = svg.replace(dup_pattern, '')

    # Mobile variant uses different x-coordinates
    if is_mobile:
        dup_pattern_m = (
            f'<g clip-path="url(#system-line-25)"><text x="72" y="956" class="system-row">'
            f'<tspan class="system-prompt" fill="{prompt_fill}">$</tspan>'
            f'<tspan fill="{text_fill}"> </tspan>'
            f'<tspan class="system-command" fill="{cmd_fill}">cat current-projects.md</tspan></text></g>\n'
            f'<g clip-path="url(#system-line-28)"><text x="90" y="972" class="system-row" fill="{text_fill}">'
            f'TrustFund  — Fund Management Platform</text></g>\n'
        )
        svg = svg.replace(dup_pattern_m, '')

    # Insert TrustFund into the existing project block (after ServiGo tech, before availability)
    insert_x = '90' if is_mobile else '546'
    svg = svg.replace(
        '>            Python · HTML · CSS · JavaScript · Google Maps API · MySQL</text></g>\n<g clip-path="url(#system-line-29)">',
        f'>            Python · HTML · CSS · JavaScript · Google Maps API · MySQL</text></g>\n'
        f'<g clip-path="url(#system-line-25)"><text x="{insert_x}" y="507" class="system-row" fill="{text_fill}"><tspan fill="{accent}">TrustFund</tspan>  — Charity &amp; Donation Management</text></g>\n'
        f'<g clip-path="url(#system-line-28)"><text x="{insert_x}" y="523.5" class="system-row" fill="{text_fill}">            Django · React · PostgreSQL · DRF · Razorpay</text></g>\n'
        '<g clip-path="url(#system-line-29)">'
    )

    # --- 3. SYNTAX HIGHLIGHTING ON PROJECT NAMES ---
    svg = svg.replace(
        '>ResumeAI  — AI Resume Analysis Platform</text>',
        f'><tspan fill="{accent}">ResumeAI</tspan>  — AI Resume Analysis Platform</text>'
    )
    svg = svg.replace(
        '>TrackWise — Employee Attendance Management System</text>',
        f'><tspan fill="{accent}">TrackWise</tspan> — Employee Attendance Management System</text>'
    )
    svg = svg.replace(
        '>Plannix   — Event Management Platform</text>',
        f'><tspan fill="{accent}">Plannix</tspan>   — Event Management Platform</text>'
    )
    svg = svg.replace(
        '>ServiGo   — Home Service Booking</text>',
        f'><tspan fill="{accent}">ServiGo</tspan>   — Home Services &amp; EV Charging</text>'
    )

    # --- 4. HIGHLIGHT EDUCATION ---
    svg = svg.replace(
        '>APJ Abdul Kalam Technological University, Kerala</text>',
        f'><tspan fill="{accent}">APJ Abdul Kalam Technological University</tspan>, Kerala</text>'
    )
    svg = svg.replace(
        '>APJ Abdul Kalam Technological University</text>',
        f'><tspan fill="{accent}">APJ Abdul Kalam Technological University</tspan>, Kerala</text>'
    )

    # --- 5. HIGHLIGHT AVAILABILITY ---
    svg = svg.replace(
        '>Open to Software Engineer Opportunities</text>',
        f'><tspan fill="{prompt_fill}">● </tspan>Open to <tspan fill="{accent}">Software Engineer</tspan> Opportunities</text>'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f'  {variant}: saved')


for v in ['dark', 'light', 'mobile-dark', 'mobile-light']:
    edit_svg(v)

print('\nAll 4 Hero SVGs updated.')
