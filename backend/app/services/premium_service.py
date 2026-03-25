def calculate_risk_factor(zone, month, past_disruptions):
    risk = 0.03  # base 3%

    # Monsoon months (India context)
    if month in ["June", "July", "August", "September"]:
        risk += 0.01

    # High-risk zones
    high_risk_zones = ["Bangalore-Urban", "Mumbai", "Delhi"]
    if zone in high_risk_zones:
        risk += 0.005

    # Past disruption behavior
    if past_disruptions >= 2:
        risk += 0.005

    return min(risk, 0.05)


def calculate_premium(data):
    weekly_income = data["weekly_income"]
    zone = data["zone"]
    month = data["month"]
    past_disruptions = data.get("past_disruptions", 0)

    if weekly_income <= 0:
        raise ValueError("Invalid income")

    risk_factor = calculate_risk_factor(zone, month, past_disruptions)

    total_premium = weekly_income * risk_factor
    worker_pays = total_premium * 0.60
    platform_pays = total_premium * 0.40

    return {
        "risk_factor": round(risk_factor, 4),
        "total_premium": round(total_premium, 2),
        "worker_pays": round(worker_pays, 2),
        "platform_pays": round(platform_pays, 2)
    }