// live trigger check 
// makes real API calls to the FastAPI backend

import { useState } from 'react'

export default function TriggerCheck() {

  // stores whatever the admin is typing in the form
  const [form, setForm] = useState({
    type: 'aqi',
    city: '',
    lat: '',
    lon: '',
    current_orders: '',
    baseline_orders: '',
    zone: '',
    platform: '',
  })

  // stores the result from the API
  const [result, setResult] = useState(null)

  // true while waiting for API response
  const [loading, setLoading] = useState(false)

  // runs when admin clicks "Run Check"
  const runCheck = async () => {
    setLoading(true)
    setResult(null)

    try {
      // build the URL based on which trigger type is selected
      let url = ''

      if (form.type === 'aqi') {
        url = `http://localhost:8000/api/triggers/aqi?city=${form.city}&current_orders=${form.current_orders}&baseline_orders=${form.baseline_orders}`
      } else if (form.type === 'rain') {
        url = `http://localhost:8000/api/triggers/rain?lat=${form.lat}&lon=${form.lon}&current_orders=${form.current_orders}&baseline_orders=${form.baseline_orders}`
      } else if (form.type === 'heat') {
        url = `http://localhost:8000/api/triggers/heat?lat=${form.lat}&lon=${form.lon}&current_orders=${form.current_orders}&baseline_orders=${form.baseline_orders}`
      } else if (form.type === 'curfew') {
        url = `http://localhost:8000/api/triggers/curfew?zone=${form.zone}`
      } else if (form.type === 'curfew_simulate') {
        url = `http://localhost:8000/api/triggers/curfew/simulate?zone=${form.zone}`
      } else if (form.type === 'outage') {
        url = `http://localhost:8000/api/triggers/outage?platform=${form.platform}`
      } else if (form.type === 'outage_simulate') {
        url = `http://localhost:8000/api/triggers/outage/simulate?platform=${form.platform}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setResult(data)

    } catch (err) {
      setResult({ error: 'Failed to connect to backend — make sure uvicorn is running' })
    }

    setLoading(false)
  }

  return (
    <div className="section">
      <h2 className="section-title">Live Trigger Check</h2>
      <p className="section-hint">Run a real-time disruption check against live APIs</p>

      <div className="trigger-form">

        {/* trigger type dropdown */}
        <div className="input-group">
          <label className="input-label">Trigger Type</label>
          <select
            className="trigger-input"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <optgroup label="Environmental (Real API)">
              <option value="aqi">🌫️ AQI Check — city name</option>
              <option value="rain">🌧️ Rain Check — lat/lon</option>
              <option value="heat">🌡️ Heat Check — lat/lon</option>
            </optgroup>
            <optgroup label="Real Monitoring">
              <option value="curfew">🚫 Curfew Check (NewsAPI)</option>
              <option value="outage">⚠️ Platform Outage (UptimeRobot)</option>
            </optgroup>
            <optgroup label="Demo Simulation">
              <option value="curfew_simulate">🚫 Simulate Curfew</option>
              <option value="outage_simulate">⚠️ Simulate Outage</option>
            </optgroup>
          </select>
        </div>

        {/* city — only for AQI */}
        {form.type === 'aqi' && (
          <div className="input-group">
            <label className="input-label">City Name</label>
            <input
              className="trigger-input"
              placeholder="e.g. Delhi, Mumbai, Chennai"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
          </div>
        )}

        {/* lat/lon — only for rain and heat */}
        {(form.type === 'rain' || form.type === 'heat') && (
          <>
            <div className="input-group">
              <label className="input-label">Latitude</label>
              <input
                className="trigger-input"
                placeholder="e.g. 13.0827 (Chennai)"
                value={form.lat}
                onChange={e => setForm({ ...form, lat: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Longitude</label>
              <input
                className="trigger-input"
                placeholder="e.g. 80.2707 (Chennai)"
                value={form.lon}
                onChange={e => setForm({ ...form, lon: e.target.value })}
              />
            </div>
          </>
        )}

        {/* zone — for curfew */}
        {(form.type === 'curfew' || form.type === 'curfew_simulate') && (
          <div className="input-group">
            <label className="input-label">Zone / City</label>
            <input
              className="trigger-input"
              placeholder="e.g. Chennai, Delhi, Mumbai"
              value={form.zone}
              onChange={e => setForm({ ...form, zone: e.target.value })}
            />
          </div>
        )}

        {/* platform — for outage */}
        {(form.type === 'outage' || form.type === 'outage_simulate') && (
          <div className="input-group">
            <label className="input-label">Platform Name</label>
            <input
              className="trigger-input"
              placeholder="e.g. Zepto, Blinkit, Swiggy"
              value={form.platform}
              onChange={e => setForm({ ...form, platform: e.target.value })}
            />
          </div>
        )}

        {/* order inputs — only for environmental triggers */}
        {['aqi', 'rain', 'heat'].includes(form.type) && (
          <>
            <div className="input-group">
              <label className="input-label">Current Orders in Zone</label>
              <input
                className="trigger-input"
                placeholder="e.g. 60"
                value={form.current_orders}
                onChange={e => setForm({ ...form, current_orders: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Baseline Orders (4-week avg)</label>
              <input
                className="trigger-input"
                placeholder="e.g. 100"
                value={form.baseline_orders}
                onChange={e => setForm({ ...form, baseline_orders: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="input-group" style={{ justifyContent: 'flex-end', alignSelf: 'flex-end' }}>
          <button className="trigger-btn" onClick={runCheck} disabled={loading}>
            {loading ? 'Checking...' : 'Run Check'}
          </button>
        </div>

      </div>

      {/* result box */}
      {result && !result.error && (
        <div className={`trigger-result ${result.confirmed ? 'result-triggered' : 'result-clear'}`}>
          <p className="result-status">
            {result.confirmed ? '🚨 DISRUPTION CONFIRMED — Payout Triggered' : '✅ No disruption detected'}
          </p>
          <div className="result-details">
            <span>Type: {result.trigger_type}</span>
            {result.raw_value !== undefined && <span>Value: {result.raw_value}</span>}
            {result.threshold !== undefined && <span>Threshold: {result.threshold}</span>}
            {result.order_drop_pct !== undefined && <span>Order drop: {result.order_drop_pct}%</span>}
            {result.headline && <span>News: {result.headline}</span>}
            {result.status && <span>Platform status: {result.status}</span>}
            <span>Source: {result.source}</span>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="trigger-result result-triggered">
          <p>❌ {result.error}</p>
        </div>
      )}

    </div>
  )
}