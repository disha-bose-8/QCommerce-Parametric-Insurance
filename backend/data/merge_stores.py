import json

# load all 3 files — note: filenames in repo are mislabeled
with open("zepto.json") as f:
    swiggy = json.load(f)  # zepto.json actually contains swiggy data

with open("blinkit.json") as f:
    blinkit = json.load(f)

with open("swiggy.json") as f:
    zepto = json.load(f)  # swiggy.json actually contains zepto data

merged = []

# normalize swiggy (from zepto.json)
for s in swiggy:
    merged.append({
        "platform": "swiggy",
        "id": s["id"],
        "name": s["name"],
        "lat": s["lat"],
        "lon": s["lng"],
        "city": s.get("city"),
        "state": s.get("state"),
    })

# normalize blinkit
for b in blinkit:
    merged.append({
        "platform": "blinkit",
        "id": str(b["id"]),
        "name": f"Blinkit Store {b['id']}",
        "lat": b["coordinates"][0],
        "lon": b["coordinates"][1],
        "city": None,
        "state": None,
    })

# normalize zepto (from swiggy.json)
for z in zepto:
    merged.append({
        "platform": "zepto",
        "id": z["id"],
        "name": z["locality"],
        "lat": z["coordinates"][0],
        "lon": z["coordinates"][1],
        "city": None,
        "state": None,
    })

# save merged file
with open("stores.json", "w") as f:
    json.dump(merged, f, indent=2)

print(f"Total stores: {len(merged)}")
print(f"Swiggy: {len(swiggy)}")
print(f"Blinkit: {len(blinkit)}")
print(f"Zepto: {len(zepto)}")