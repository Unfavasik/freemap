<script setup lang="ts">
import type { LatLng, NavigatrMap, NavigatrMarker, RouteResult } from '@navigatr/web'

const { getNavigatr } = useNavigatr()

const shop: LatLng = { lat: 24.0973125, lng: 88.2735625 }
const fallbackOrigin: LatLng = { lat: 24.1044927, lng: 88.2510635 }
const googleMapsUrl = 'https://maps.app.goo.gl/nasrFpHJTByb4Yh49'
const phoneUrl = 'tel:+919434886786'

type TravelMode = 'drive' | 'bike' | 'walk'
const mode = ref<TravelMode>('drive')
const origin = ref<LatLng | null>(null)
const route = ref<RouteResult | null>(null)
const loading = ref(false)
const locationStatus = ref('Getting your location…')
const errorMessage = ref('')
let map: NavigatrMap | null = null
let shopMarker: NavigatrMarker | null = null
let userMarker: NavigatrMarker | null = null

const modeDetails: Record<TravelMode, { label: string; icon: string }> = {
  drive: { label: 'Drive', icon: '🚗' },
  bike: { label: 'Bike', icon: '🏍' },
  walk: { label: 'Walk', icon: '🚶' },
}

function setOrigin(next: LatLng, label: string) {
  origin.value = next
  locationStatus.value = label
  if (!map) return
  if (userMarker) userMarker.remove()
  userMarker = map.addMarker({
    ...next,
    label: 'You are here',
    iconHtml: '<div class="user-pin"><span></span></div>',
  })
}

async function findUserLocation() {
  if (!import.meta.client || !navigator.geolocation) {
    setOrigin(fallbackOrigin, 'Berhampore fallback')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (position) => setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude }, 'Your location'),
    () => setOrigin(fallbackOrigin, 'Berhampore fallback'),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
  )
}

async function calculateRoute() {
  if (!origin.value) await findUserLocation()
  if (!origin.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const nav = await getNavigatr()
    route.value = await nav.route({ origin: origin.value, destination: shop, mode: mode.value })
    map?.clearRoute()
    if (route.value) {
      map?.drawRoute(route.value.polyline)
      map?.fitRoute(route.value.polyline)
    }
  } catch (error) {
    errorMessage.value = 'Route পাওয়া যায়নি। আবার চেষ্টা করুন।'
    console.error(error)
  } finally {
    loading.value = false
  }
}

function selectMode(next: TravelMode) {
  mode.value = next
  if (route.value) calculateRoute()
}

onMounted(async () => {
  const nav = await getNavigatr()
  map = nav.map({ container: 'shop-map', center: shop, zoom: 14 })
  shopMarker = map.addMarker({
    ...shop,
    label: 'Rofik Godi Centre',
    iconHtml: '<div class="shop-pin"><span>RG</span></div>',
  })
  await findUserLocation()
})

onUnmounted(() => {
  shopMarker?.remove()
  userMarker?.remove()
})
</script>

<template>
  <div class="shop-locator">
    <div id="shop-map" class="shop-map"></div>
    <div class="map-wash"></div>

    <header class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark"><span></span></div>
        <div>
          <strong>ROFIK <em>GODI</em> CENTRE</strong>
          <small>BIKE • TOTO • SEAT COVERS</small>
        </div>
      </div>
      <a class="icon-action" :href="googleMapsUrl" target="_blank" rel="noopener" aria-label="Open Google Maps">↗</a>
    </header>

    <div class="map-actions">
      <button class="round-action" aria-label="Use my location" @click="findUserLocation">⌾</button>
      <button class="round-action" aria-label="Open Google Maps" @click="window.open(googleMapsUrl, '_blank')">↗</button>
    </div>

    <section class="place-sheet">
      <div class="sheet-handle"></div>
      <div class="place-heading">
        <div class="place-thumb"><span>RG</span></div>
        <div class="place-title">
          <h1>Rofik Godi Centre</h1>
          <div class="rating"><span>★</span> 4.3 <small>43 reviews</small></div>
          <p>Auto upholsterer • Bike • Toto • Seat Covers</p>
        </div>
        <a class="call-button" :href="phoneUrl" aria-label="Call Rofik Godi Centre">☎</a>
      </div>

      <div class="address-row">
        <span class="address-icon">⌖</span>
        <span>Kadbeltal, Petrol Pump More, Raninagar,<br />Keshobnagar, Berhampore, West Bengal 742101</span>
      </div>

      <div class="status-row"><span class="open-dot"></span><strong>Open</strong><span>· Closes 7:30 PM</span><span class="location-note">{{ locationStatus }}</span></div>

      <div class="store-actions">
        <a class="store-action secondary" :href="googleMapsUrl" target="_blank" rel="noopener">Visit our store <span>↗</span></a>
        <button class="store-action primary" :disabled="loading" @click="calculateRoute">Get directions <span>→</span></button>
      </div>

      <div class="travel-tabs">
        <button v-for="(detail, key) in modeDetails" :key="key" :class="['travel-tab', { active: mode === key }]" @click="selectMode(key as TravelMode)">
          <span class="travel-icon">{{ detail.icon }}</span>
          <span>{{ detail.label }}</span>
          <strong v-if="route && mode === key">{{ route.durationText }}</strong>
          <small v-if="route && mode === key">{{ route.distanceText }}</small>
        </button>
      </div>

      <button class="directions-button" :disabled="loading" @click="calculateRoute">
        <span>{{ loading ? 'Finding route…' : route ? 'Update directions' : 'Get directions' }}</span><span class="arrow">→</span>
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <div class="sheet-footer"><span>Plus Code: 37WF+WC</span><a :href="googleMapsUrl" target="_blank" rel="noopener">View on Google Maps ↗</a></div>
    </section>
  </div>
</template>

<style scoped>
.shop-locator { min-height: 100vh; position: relative; overflow: hidden; background: #dce7df; color: #18201e; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
.shop-map { position: absolute; inset: 0; min-height: 100vh; }
.map-wash { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(241,246,242,.18) 0%, rgba(241,246,242,.05) 42%, rgba(248,247,243,.90) 79%, #f8f7f3 100%); }
.topbar { position: absolute; z-index: 5; top: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 20px; background: rgba(255,255,255,.92); box-shadow: 0 8px 30px rgba(30,47,38,.12); }
.brand-lockup { display: flex; gap: 10px; align-items: center; }
.brand-mark { width: 36px; height: 30px; border-radius: 7px 18px 7px 18px; background: linear-gradient(150deg, #ef2828 0 48%, #121b22 49% 57%, #ef2828 58%); transform: skew(-12deg); box-shadow: 0 3px 8px rgba(239,40,40,.22); }
.brand-mark span { display: block; width: 13px; height: 5px; margin: 15px 0 0 10px; background: white; border-radius: 20px; opacity: .75; }
.brand-lockup strong { display: block; font-size: 12px; letter-spacing: -.03em; }
.brand-lockup em { color: #e92323; font-style: normal; }
.brand-lockup small { display: block; margin-top: 2px; color: #6d7773; font-size: 8px; letter-spacing: .12em; }
.icon-action, .round-action { display: grid; place-items: center; color: #24312d; background: #fff; border: 0; text-decoration: none; cursor: pointer; }
.icon-action { width: 34px; height: 34px; border-radius: 50%; font-size: 19px; }
.map-actions { position: absolute; z-index: 5; right: 20px; top: 94px; display: grid; gap: 10px; }
.round-action { width: 44px; height: 44px; border-radius: 50%; box-shadow: 0 5px 18px rgba(31,53,41,.16); font-size: 22px; }
.place-sheet { position: absolute; z-index: 4; left: 50%; bottom: 20px; width: min(680px, calc(100% - 24px)); transform: translateX(-50%); padding: 13px 18px 15px; border-radius: 28px; background: rgba(255,254,251,.96); box-shadow: 0 -8px 45px rgba(30,49,37,.16); backdrop-filter: blur(14px); }
.sheet-handle { width: 45px; height: 4px; margin: 0 auto 15px; border-radius: 3px; background: #d1d5d0; }
.place-heading { display: flex; align-items: center; gap: 11px; }
.place-thumb { display: grid; flex: 0 0 55px; place-items: center; width: 55px; height: 55px; border-radius: 15px; background: linear-gradient(145deg, #18222a, #e92626 52%, #ff6053); color: #fff; font-weight: 900; font-size: 17px; letter-spacing: -.1em; box-shadow: inset 0 0 0 2px rgba(255,255,255,.46); }
.place-title { min-width: 0; flex: 1; }
.place-title h1 { margin: 0 0 2px; font-size: 22px; line-height: 1.1; letter-spacing: -.045em; }
.rating { color: #ef8d00; font-size: 13px; font-weight: 800; }.rating span { color: #f3ad24; }.rating small { color: #78817c; font-size: 11px; font-weight: 500; margin-left: 3px; }.place-title p { margin: 4px 0 0; color: #718079; font-size: 11px; }
.call-button { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; color: #fff; background: #1d3028; text-decoration: none; font-size: 17px; }
.address-row { display: flex; gap: 10px; margin: 15px 2px 8px; color: #44514b; font-size: 12px; line-height: 1.45; }.address-icon { color: #e72323; font-size: 18px; }
.status-row { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; color: #77817b; font-size: 11px; }.status-row strong { color: #1e9960; }.open-dot { width: 7px; height: 7px; border-radius: 50%; background: #23ae67; }.location-note { margin-left: auto; color: #98a09b; }
.store-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 13px; }.store-action { display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; border: 1px solid #e4e8e3; border-radius: 13px; text-decoration: none; font-size: 12px; font-weight: 800; cursor: pointer; }.store-action span { font-size: 18px; line-height: 12px; }.store-action.secondary { background: #fff; color: #27342e; }.store-action.primary { border-color: #ed2727; background: #ed2727; color: #fff; box-shadow: 0 7px 14px rgba(237,39,39,.2); }.store-action:disabled { opacity: .65; cursor: wait; }
.travel-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 14px 0 12px; }.travel-tab { display: grid; grid-template-columns: auto 1fr; gap: 0 8px; align-items: center; padding: 10px 10px; border: 1px solid #e7e9e5; border-radius: 16px; background: #fff; color: #727c76; cursor: pointer; text-align: left; font-size: 12px; }.travel-tab.active { border-color: #f02525; box-shadow: inset 0 0 0 1px #f02525; color: #1d2924; }.travel-icon { grid-row: span 2; font-size: 18px; }.travel-tab strong { color: #1e2924; font-size: 12px; }.travel-tab small { color: #87918b; font-size: 10px; }
.directions-button { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 18px; border: 0; border-radius: 15px; background: #ed2727; color: #fff; box-shadow: 0 10px 20px rgba(237,39,39,.25); cursor: pointer; font-weight: 800; font-size: 15px; }.directions-button:disabled { opacity: .65; cursor: wait; }.arrow { font-size: 25px; line-height: 16px; }.error-message { margin: 8px 0 0; color: #d32727; font-size: 11px; }.sheet-footer { display: flex; justify-content: space-between; gap: 10px; margin-top: 10px; color: #98a09b; font-size: 10px; }.sheet-footer a { color: #e32626; text-decoration: none; font-weight: 700; }
:deep(.shop-pin) { display: grid; place-items: center; width: 42px; height: 42px; border: 3px solid #fff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: #e92525; box-shadow: 0 4px 12px rgba(100,20,20,.3); }.shop-pin span { transform: rotate(45deg); color: #fff; font-size: 11px; font-weight: 900; }.shop-pin:after { content: ''; position: absolute; bottom: -10px; width: 7px; height: 7px; border-radius: 50%; background: #202924; }.user-pin { display: grid; place-items: center; width: 24px; height: 24px; border: 4px solid #fff; border-radius: 50%; background: #2278e8; box-shadow: 0 2px 9px rgba(20,60,130,.35); }.user-pin span { width: 7px; height: 7px; border-radius: 50%; background: white; }
@media (max-width: 560px) { .topbar { top: 12px; left: 12px; right: 12px; }.map-actions { top: 84px; right: 12px; }.place-sheet { bottom: 10px; width: calc(100% - 20px); padding: 11px 14px 12px; border-radius: 24px; }.place-title h1 { font-size: 19px; }.place-title p { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }.travel-tab { padding: 9px 7px; font-size: 11px; }.location-note { display: none; } }
</style>
