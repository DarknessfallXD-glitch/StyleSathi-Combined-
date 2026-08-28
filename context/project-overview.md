# StyleSathi — Project Overview

## Overview

StyleSathi is a fashion discovery and AI styling assistant for the South Asian market (Nepal, India, and beyond). Users search for clothing and accessories using natural language, discover featured collections and a personalized "Just For You" feed, try garments on virtually using AI, and purchase via curated product listings and merchant affiliate links. It is built as a React Native / Expo mobile app (frontend) backed by a Python FastAPI service (backend).

## Goals

1. Let users discover fashion products by searching in natural language.
2. Provide personalized product feeds (featured collections and "Just For You").
3. Let users virtually try on garments using AI image generation.
4. Let users save products to a wishlist and keep search history locally.
5. Support location-aware product sourcing and merchant affiliate integrations (Daraz, Flipkart, Amazon PAAPI).
6. Let Nepali and Indian users see relevant local products and currencies (NPR, INR, USD).

## Core User Flow

1. User opens the app and lands on the welcome screen.
2. User signs up or signs in (Supabase auth; OAuth callback supported).
3. User optionally completes onboarding and personalization (style + language preferences).
4. User lands on the home screen with search, featured collections, and "Just For You".
5. User searches with natural language; backend returns ranked top + more results.
6. User views a product detail page.
7. User can save to wishlist or trigger an AI try-on.
8. User navigates via the bottom tab bar (home, style/try-on, saved, profile).

## Features

### Authentication and Onboarding
- Sign-up, sign-in, and OAuth callback routing.
- Welcome and onboarding screens.
- Language and style personalization screens.
- Session persistence via AsyncStorage; Redirect logic in root layout.

### Search and Discovery
- Natural-language search bar on the home screen.
- Recent search history (local, AsyncStorage) with add/delete/clear.
- Backend search: vector search over curated products, fallback results, and merchant affiliate feeds.
- Location-aware results (NP, IN, US, UK, AE).

### Product Catalog
- Curated product listings (with pgvector embeddings for similarity search).
- Affiliate products from Daraz, Flipkart, and Amazon PAAPI.
- Featured collections and "Just For You" personalization feeds.

### Styling and Try-On
- AI virtual try-on (Replicate / Flux backend).
- Style selection and upload screens.

### Account and Subscription
- Profile and settings screens.
- Subscription plans (Stripe), daily usage limits.

## Scope

### In Scope
- Mobile app (React Native / Expo, expo-router).
- Supabase auth + Postgres with pgvector.
- Python FastAPI backend service.
- Curated + affiliate product search.
- AI try-on via Replicate/Flux.
- Wishlist, search history, subscriptions.

### Out Of Scope
- Desktop/native packaging (no Electron/Tauri build for now).
- Social collaboration features.
- Inventory/fulfillment logistics.
- Admin dashboard.

## Success Criteria

1. A signed-in user can search in natural language and see relevant ranked products.
2. Search returns both curated and affiliate products correctly merged and ranked.
3. Featured collections and "Just For You" render with loading, empty, and error states.
4. A user can save products to wishlist and manage local search history.
5. AI try-on returns a generated image for an uploaded garment.
6. The backend builds and serves all routers (user, audio, search, subscription, preferences, try-on) without errors.

## Team Ownership

- **Utsav** — Backend owner (Python FastAPI, Supabase, search services, affiliate integrations, AI try-on).
- **Reejana** — Frontend/UI owner (React Native / Expo screens, components, theming, navigation).
- Shared — The six context files and build plan are maintained collaboratively.
