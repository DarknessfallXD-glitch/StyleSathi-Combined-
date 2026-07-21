#!/usr/bin/env python3
"""Generate StyleSathi Backend documentation PDF."""

from fpdf import FPDF
import os

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "StyleSathi_Documentation.pdf")


class DocPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "StyleSathi Backend - API & Integration Guide", align="C", new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 60, 114)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def sub_title(self, title):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(60, 90, 140)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body_text(self, text):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def code_block(self, text):
        self.set_font("Courier", "", 8)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(30, 30, 30)
        for line in text.strip().split("\n"):
            self.cell(0, 4.5, f"  {line}", new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(3)

    def bullet(self, text, bold_prefix=""):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(40, 40, 40)
        if bold_prefix:
            self.cell(5, 5, "*")
            self.set_font("Helvetica", "B", 9)
            self.cell(0, 5, f" {bold_prefix}", new_x="LMARGIN", new_y="NEXT")
            self.set_x(15)
            self.set_font("Helvetica", "", 9)
            self.multi_cell(0, 5, f"  {text}")
        else:
            self.cell(0, 5, f"  * {text}", new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def endpoint_box(self, method, path, desc, auth, body="", response=""):
        colors = {
            "GET": (50, 150, 50),
            "POST": (50, 100, 200),
            "PATCH": (200, 150, 50),
            "PUT": (200, 120, 30),
        }
        c = colors.get(method, (100, 100, 100))

        self.set_fill_color(c[0], c[1], c[2])
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 10)
        self.cell(18, 7, f" {method}", fill=True, align="C")
        self.set_text_color(30, 30, 30)
        self.set_font("Courier", "", 10)
        self.cell(0, 7, f"  {path}", new_x="LMARGIN", new_y="NEXT")

        self.set_font("Helvetica", "", 9)
        self.set_text_color(60, 60, 60)
        self.cell(0, 5, f"  {desc}", new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(150, 80, 80)
        self.cell(0, 5, f"  Auth: {auth}", new_x="LMARGIN", new_y="NEXT")

        if body:
            self.set_text_color(40, 40, 40)
            self.set_font("Helvetica", "B", 8)
            self.cell(0, 5, "  Request body:", new_x="LMARGIN", new_y="NEXT")
            self.set_font("Courier", "", 7.5)
            self.set_fill_color(248, 248, 248)
            for line in body.strip().split("\n"):
                self.cell(0, 4, f"   {line}", new_x="LMARGIN", new_y="NEXT", fill=True)

        if response:
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(40, 40, 40)
            self.cell(0, 5, "  Response:", new_x="LMARGIN", new_y="NEXT")
            self.set_font("Courier", "", 7.5)
            self.set_fill_color(248, 248, 248)
            for line in response.strip().split("\n"):
                self.cell(0, 4, f"   {line}", new_x="LMARGIN", new_y="NEXT", fill=True)

        self.ln(4)

    def warning_box(self, text):
        self.set_fill_color(255, 245, 220)
        self.set_text_color(140, 100, 20)
        self.set_font("Helvetica", "B", 9)
        self.cell(0, 6, "  [!]  " + text, new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(2)

    def check_item(self, text):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(40, 40, 40)
        self.cell(0, 5, f"  [ ] {text}", new_x="LMARGIN", new_y="NEXT")
        self.ln(1)


def build_pdf():
    pdf = DocPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)

    # ============ COVER ============
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(30, 60, 114)
    pdf.cell(0, 15, "StyleSathi Backend", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, "API Documentation & Frontend Integration Guide", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "FastAPI  |  Supabase  |  PostgreSQL / pgvector  |  Stripe Demo", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(15)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 6, "Generated from StyleSathi Backend codebase", align="C", new_x="LMARGIN", new_y="NEXT")

    # ============ TOC ============
    pdf.add_page()
    pdf.section_title("Table of Contents")
    toc = [
        "1.  Architecture Overview",
        "2.  Authentication Flow",
        "3.  API Endpoints Reference",
        "    3.1  User",
        "    3.2  Audio / Voice",
        "    3.3  Preferences",
        "    3.4  Subscription & Payments",
        "    3.5  Search",
        "    3.6  Try-On",
        "4.  Frontend Integration Guide",
        "5.  Setup Checklist",
        "6.  Environment Variables Reference",
    ]
    for item in toc:
        pdf.set_font("Courier" if item.startswith("   ") else "Helvetica", "", 10)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(0, 7, f"  {item.strip()}", new_x="LMARGIN", new_y="NEXT")

    # ============ 1. ARCHITECTURE ============
    pdf.add_page()
    pdf.section_title("1.  Architecture Overview")

    pdf.body_text(
        "StyleSathi is a virtual fashion try-on and clothing search backend. "
        "Users can speak or type a clothing query, get AI-ranked results from "
        "local curated products and affiliate APIs (Amazon, Flipkart, Daraz), "
        "then generate a photo-realistic try-on image using FLUX.1."
    )

    pdf.sub_title("Tech Stack")
    pdf.bullet("Python web framework", "FastAPI")
    pdf.bullet("Auth + Database + Storage", "Supabase (PostgreSQL)")
    pdf.bullet("Vector search", "pgvector (VECTOR(1024))")
    pdf.bullet("Embeddings", "BGE-M3 (local) or OpenAI")
    pdf.bullet("Voice transcription", "faster-whisper (local) or OpenAI Whisper")
    pdf.bullet("Try-on generation", "FLUX.1 via Replicate or Colab")
    pdf.bullet("Payments", "Stripe (demo mode fakes the flow)")

    pdf.sub_title("Data Flow")
    pdf.body_text(
        "Frontend (React Native / Web) -> REST API (FastAPI) -> Supabase\n\n"
        "Search pipeline:\n"
        "  1. POST /search?query=...\n"
        "  2. BGE-M3 generates query embedding (1024-dim)\n"
        "  3. Vector search in products table (if location = NP)\n"
        "  4. Keyword extraction -> affiliate API search\n"
        "  5. Affiliate results ranked by cosine similarity\n"
        "  6. Returns top 3 (for try-on) + more results\n\n"
        "Try-on pipeline:\n"
        "  1. POST /try-on/generate (user photo + product image)\n"
        "  2. Usage check (free tries or subscription daily limit)\n"
        "  3. FLUX.1 generates wearing image\n"
        "  4. Saved to Supabase Storage\n"
        "  5. Returns public image URL"
    )

    # ============ 2. AUTH ============
    pdf.add_page()
    pdf.section_title("2.  Authentication Flow")
    pdf.body_text(
        "StyleSathi uses Supabase Auth (JWT-based). The frontend must handle "
        "user sign-up/sign-in via Supabase directly, then pass the access token "
        "to the backend in the Authorization header."
    )

    pdf.sub_title("Step-by-step")
    pdf.bullet("User signs up or logs in via the Supabase client on the frontend", "1")
    pdf.bullet("Supabase returns a JWT access token", "2")
    pdf.bullet("Frontend sends every API request with header:", "3")
    pdf.code_block('Authorization: Bearer <JWT_TOKEN>')
    pdf.bullet("Backend validates the JWT with Supabase Auth", "4")
    pdf.bullet("If valid, request proceeds; if not, 401 is returned", "5")

    pdf.warning_box("The backend does NOT handle sign-up/login. Use the Supabase JS/Flutter SDK on the frontend for authentication.")

    pdf.sub_title("Token structure")
    pdf.body_text(
        "The JWT contains:\n"
        "  - sub: User ID (UUID, used as primary key in users table)\n"
        "  - email: User's email address\n"
        "  - user_metadata: contains full_name, avatar_url, etc."
    )

    # ============ 3. API ENDPOINTS ============
    pdf.add_page()
    pdf.section_title("3.  API Endpoints Reference")
    pdf.body_text("Base URL: http://<host>:8000")

    # 3.1 User
    pdf.sub_title("3.1  User Endpoints")

    pdf.endpoint_box(
        "GET", "/user/me",
        "Get the current authenticated user's profile. Creates user record if first time.",
        "Required",
        "",
        '{\n'
        '  "id": "uuid",\n'
        '  "email": "user@example.com",\n'
        '  "full_name": "John Doe",\n'
        '  "vibes": ["casual", "formal"],\n'
        '  "language_preference": "en",\n'
        '  "onboarding_completed": false,\n'
        '  "subscription_status": "inactive",\n'
        '  "free_tries_used": 0,\n'
        '  "free_tries_limit": 3,\n'
        '  "user_usage": 0,\n'
        '  "daily_limit": 20\n'
        '}'
    )

    pdf.endpoint_box(
        "PATCH", "/user/me/update",
        "Update user profile fields.",
        "Required",
        '{\n'
        '  "full_name": "New Name",\n'
        '  "vibes": ["streetwear", "minimalist"],\n'
        '  "language_preference": "ne",\n'
        '  "onboarding_completed": true\n'
        '}',
        '{"id": "uuid", "email": "...", ...}'
    )

    pdf.endpoint_box(
        "GET", "/user/me/tries",
        "Get free try-on tries remaining.",
        "Required",
        "",
        '{\n'
        '  "used": 1,\n'
        '  "limit": 3,\n'
        '  "remaining": 2\n'
        '}'
    )

    # 3.2 Audio
    pdf.add_page()
    pdf.sub_title("3.2  Audio / Voice")
    pdf.body_text("Transcribe voice input (Nepali/English) to text for search queries.")

    pdf.endpoint_box(
        "POST", "/audio/speech-to-text",
        "Upload an audio file and get transcribed text. Supports WAV, MP3, M4A.",
        "Required",
        "Form-data: file=<audio_file>",
        '{"text": "show me a red kurta"}'
    )

    pdf.warning_box("VOICE_SERVICE_TYPE=local uses faster-whisper (CPU). First call downloads ~1.5GB model.")

    # 3.3 Preferences
    pdf.sub_title("3.3  Preferences")

    pdf.endpoint_box(
        "GET", "/preferences/me",
        "Get the user's preferences JSON.",
        "Required",
        "",
        '{"preferences": {"style": "casual", "size": "M"}}'
    )

    pdf.endpoint_box(
        "PATCH", "/preferences/me",
        "Set or update preferences (stored as JSONB).",
        "Required",
        '{"style": "formal", "size": "L", "color": "blue"}',
        '{"success": true}'
    )

    # 3.4 Subscription
    pdf.add_page()
    pdf.sub_title("3.4  Subscription & Payments")
    pdf.body_text(
        "Uses Stripe Checkout Sessions. When STRIPE_SECRET_KEY is empty or a placeholder, "
        "demo mode activates - no real payment needed. Demo sessions are prefixed with demo_."
    )

    pdf.endpoint_box(
        "GET", "/subscription/plans",
        "List available subscription plans (public, no auth required).",
        "None",
        "",
        '{\n'
        '  "plans": [\n'
        '    {"id": "basic", "name": "Basic", "price": {"amount": 499, "currency": "USD"}, "days": 30},\n'
        '    {"id": "standard", "name": "Standard", "price": {"amount": 999, "currency": "USD"}, "days": 30},\n'
        '    {"id": "pro", "name": "Pro", "price": {"amount": 1999, "currency": "USD"}, "days": 30}\n'
        '  ]\n'
        '}'
    )

    pdf.endpoint_box(
        "POST", "/subscription/create",
        "Create a checkout session for a plan.",
        "Required",
        '{"planId": "basic"}',
        '{\n'
        '  "session_id": "cs_test_...",\n'
        '  "payment_url": "https://checkout.stripe.com/..."\n'
        '}'
    )
    pdf.body_text("In demo mode, payment_url is a fake URL and session_id starts with demo_.")

    pdf.endpoint_box(
        "POST", "/subscription/verify",
        "Verify payment and activate subscription. Demo mode immediately activates.",
        "Required",
        '{"session_id": "cs_test_xxx"}',
        '"completed"'
    )

    # 3.5 Search
    pdf.add_page()
    pdf.sub_title("3.5  Search")
    pdf.body_text(
        "The core AI pipeline. Accepts a text query, detects user location, "
        "searches vector DB and affiliate APIs, ranks by semantic similarity."
    )

    pdf.endpoint_box(
        "POST", "/search/search?query=<text>",
        "Search for fashion products. Returns top 3 for try-on + more results.",
        "Required",
        "Query params: query (required), location (optional: NP/IN/US), category (optional), limit (default 20)",
        '{\n'
        '  "query": "red kurta",\n'
        '  "keywords": ["red", "kurta"],\n'
        '  "location": "NP",\n'
        '  "total_results": 5,\n'
        '  "top_results": [\n'
        '    {"title": "...", "price": 1500, "image_url": "...", "score": 0.92}\n'
        '  ],\n'
        '  "more_results": [...]\n'
        '}'
    )

    pdf.body_text(
        "Location detection: reads language_preference from user profile.\n"
        "  ne/NP -> Nepal (vector DB + Daraz)\n"
        "  hi/IN -> India (Flipkart + Amazon.in)\n"
        "  other -> US (Amazon.com)\n\n"
        "Affiliate APIs require keys in .env. If blank, they return empty results silently."
    )

    # 3.6 Try-On
    pdf.sub_title("3.6  Try-On Generation")

    pdf.endpoint_box(
        "POST", "/try-on/generate",
        "Generate a try-on image: user photo + product clothing image. Checks usage limits first.",
        "Required",
        "Form-data:\n"
        "  user_image: <file> (photo of user)\n"
        "  product_image: <file> (clothing image)\n"
        "  prompt: (optional) custom FLUX prompt",
        '{\n'
        '  "generated_image_url": "https://...supabase.co/...",\n'
        '  "usage_remaining": 2\n'
        '}'
    )

    pdf.warning_box("Requires REPLICATE_API_TOKEN or COLAB_FLUX_URL in .env. Without these, the endpoint returns 500.")

    # ============ 4. FRONTEND INTEGRATION ============
    pdf.add_page()
    pdf.section_title("4.  Frontend Integration Guide")

    pdf.sub_title("4.1  Initialization (React Native example)")
    pdf.code_block(
        "// 1. Install supabase-js\n"
        "npm install @supabase/supabase-js\n\n"
        "// 2. Initialize Supabase client\n"
        "import { createClient } from '@supabase/supabase-js'\n\n"
        "const supabase = createClient(\n"
        "  'https://oqdpwtyjbgzufeblrnww.supabase.co',\n"
        "  'sb_publishable_O_uy5g170K9G0w9zWBLCCQ_ZCp2o3x4'\n"
        ")"
    )

    pdf.sub_title("4.2  Authentication (Sign-up / Login)")
    pdf.code_block(
        "// Sign Up\n"
        "const { data, error } = await supabase.auth.signUp({\n"
        "  email: 'user@example.com',\n"
        "  password: 'secure_password',\n"
        "  options: { data: { full_name: 'John Doe' } }\n"
        "})\n\n"
        "// Sign In\n"
        "const { data, error } = await supabase.auth.signInWithPassword({\n"
        "  email: 'user@example.com',\n"
        "  password: 'secure_password'\n"
        "})\n\n"
        "// Get token\n"
        "const token = data.session.access_token"
    )

    pdf.sub_title("4.3  Calling the Backend API")
    pdf.code_block(
        "const API_BASE = 'http://your-backend:8000'\n\n"
        "async function apiCall(method, path, body?, params?) {\n"
        "  const token = (await supabase.auth.getSession())\n"
        "    .data.session?.access_token\n\n"
        "  const url = new URL(API_BASE + path)\n"
        "  if (params) url.search = new URLSearchParams(params)\n\n"
        "  const res = await fetch(url, {\n"
        "    method,\n"
        "    headers: {\n"
        "      'Authorization': `Bearer ${token}`,\n"
        "      'Content-Type': 'application/json',\n"
        "    },\n"
        "    body: body ? JSON.stringify(body) : undefined,\n"
        "  })\n"
        "  if (!res.ok) throw await res.json()\n"
        "  return res.json()\n"
        "}"
    )

    pdf.sub_title("4.4  Search Flow (Voice or Text)")
    pdf.code_block(
        "// 1. User speaks -> transcribe\n"
        "const formData = new FormData()\n"
        "formData.append('file', audioBlob, 'audio.wav')\n"
        "const { text } = await fetch(\n"
        "  `${API_BASE}/audio/speech-to-text`,\n"
        "  { method: 'POST', headers: { 'Authorization': `Bearer ${token}` },\n"
        "    body: formData }\n"
        ").then(r => r.json())\n\n"
        "// 2. Search products\n"
        "const results = await apiCall(\n"
        "  'POST', '/search/search', null,\n"
        "  { query: text, location: 'NP' }\n"
        ")\n\n"
        "// 3. top_results are the top 3 -> show with 'Try On' button\n"
        "// more_results are the rest -> show in a scrollable list"
    )

    pdf.sub_title("4.5  Try-On Flow")
    pdf.code_block(
        "const formData = new FormData()\n"
        "formData.append('user_image', userPhoto, 'user.jpg')\n"
        "formData.append('product_image', productImg, 'product.jpg')\n\n"
        "const res = await fetch(`${API_BASE}/try-on/generate`, {\n"
        "  method: 'POST',\n"
        "  headers: { 'Authorization': `Bearer ${token}` },\n"
        "  body: formData,\n"
        "})\n"
        "const { generated_image_url } = await res.json()\n"
        "// Display the result image in an <Image> component"
    )

    pdf.sub_title("4.6  Subscription Flow (Demo Mode)")
    pdf.code_block(
        "// 1. Get plans\n"
        "const plans = await apiCall('GET', '/subscription/plans')\n\n"
        "// 2. Create checkout\n"
        "const { session_id, payment_url } = await apiCall(\n"
        "  'POST', '/subscription/create',\n"
        "  { planId: 'basic' }\n"
        ")\n\n"
        "// 3. In demo mode, just call verify directly\n"
        "const status = await apiCall(\n"
        "  'POST', '/subscription/verify',\n"
        "  { session_id }\n"
        ")\n"
        "// status = 'completed' -> subscription activated\n\n"
        "// 4. Redirect to payment_url in real Stripe mode\n"
        "// Stripe redirects back to success_url with session_id\n"
        "// Then call verify on return"
    )

    pdf.sub_title("4.7  Checking User State")
    pdf.code_block(
        "// On app launch, check user state\n"
        "const user = await apiCall('GET', '/user/me')\n\n"
        "// Check tries remaining\n"
        "const tries = await apiCall('GET', '/user/me/tries')\n\n"
        "// Check if onboarding is needed\n"
        "if (!user.onboarding_completed) {\n"
        "  // Show vibe/language picker screen\n"
        "  await apiCall('PATCH', '/user/me/update', {\n"
        "    vibes: ['casual', 'formal'],\n"
        "    language_preference: 'en',\n"
        "    onboarding_completed: true\n"
        "  })\n"
        "}"
    )

    # ============ 5. SETUP CHECKLIST ============
    pdf.add_page()
    pdf.section_title("5.  Setup Checklist")

    pdf.sub_title("Required steps:")
    pdf.check_item("Clone the repo and cd into Backend/")
    pdf.check_item("Create .env with your Supabase credentials (already done)")
    pdf.check_item("Run supabase_migration.sql in Supabase SQL Editor")
    pdf.check_item("pip install -r requirements.txt")
    pdf.check_item("python scripts/seed_products.py")
    pdf.check_item("python scripts/seed_embeddings.py")
    pdf.check_item("Create Supabase Storage bucket 'tryon-images' (public)")
    pdf.check_item("uvicorn app:app --reload")

    pdf.sub_title("Optional / when needed:")
    pdf.check_item("Set STRIPE_SECRET_KEY for real payment processing")
    pdf.check_item("Set REPLICATE_API_TOKEN to enable FLUX try-on")
    pdf.check_item("Set COLAB_FLUX_URL as alternative to Replicate")
    pdf.check_item("Add Amazon, Flipkart, Daraz affiliate keys for live product search")
    pdf.check_item("Change VOICE_SERVICE_TYPE=cloud and set OPENAI_API_KEY for cloud whisper")
    pdf.check_item("Change EMBEDDING_PROVIDER=openai for cloud embeddings")

    # ============ 6. ENV REFERENCE ============
    pdf.add_page()
    pdf.section_title("6.  Environment Variables Reference")

    env_vars = [
        ("SUPABASE_PROJECT_URL", "Your Supabase project URL", "REQUIRED"),
        ("SUPABASE_API_KEY", "Supabase anon/publishable key", "REQUIRED"),
        ("SUPABASE_SERVICE_KEY", "Supabase service_role key (bypasses RLS)", "REQUIRED"),
        ("OPENAI_API_KEY", "Used only if VOICE_SERVICE_TYPE=cloud or EMBEDDING_PROVIDER=openai", "Optional"),
        ("VOICE_SERVICE_TYPE", "'local' (faster-whisper) or 'cloud' (OpenAI)", "Default: local"),
        ("STRIPE_SECRET_KEY", "Stripe secret key. Empty/placeholder = demo mode", "Optional"),
        ("EMBEDDING_PROVIDER", "'local' (BGE-M3) or 'openai'", "Default: local"),
        ("EMBEDDING_DIMENSION", "Embedding vector dimension (default 1024)", "Default: 1024"),
        ("REPLICATE_API_TOKEN", "Replicate API token for FLUX try-on", "Optional"),
        ("COLAB_FLUX_URL", "Colab-hosted FLUX endpoint URL", "Optional"),
        ("STORAGE_BUCKET", "Supabase Storage bucket for try-on images", "Default: tryon-images"),
        ("AMAZON_ACCESS_KEY", "Amazon PAAPI access key", "Optional"),
        ("AMAZON_SECRET_KEY", "Amazon PAAPI secret key", "Optional"),
        ("AMAZON_ASSOCIATE_TAG", "Amazon affiliate tag", "Optional"),
        ("FLIPKART_AFFILIATE_ID", "Flipkart affiliate ID", "Optional"),
        ("FLIPKART_API_KEY", "Flipkart affiliate API key", "Optional"),
        ("DARAZ_API_KEY", "Daraz API key", "Optional"),
    ]

    for var, desc, req in env_vars:
        pdf.set_font("Courier", "B", 8)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(60, 5, f"  {var}")
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(0, 5, f" {desc}", new_x="LMARGIN", new_y="NEXT")

    # Save
    pdf.output(PDF_PATH)
    print(f"PDF generated: {PDF_PATH}")


if __name__ == "__main__":
    build_pdf()
