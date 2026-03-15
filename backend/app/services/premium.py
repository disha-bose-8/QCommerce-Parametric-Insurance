# constants
PREMIUM_RATE = 0.05       # premium is 5% of weekly income
WORKER_SHARE = 0.60       # worker pays 60% of that premium
PLATFORM_SHARE = 0.40     # platform pays the other 40%
PAYOUT_RATE = 0.50        # when disruption happens worker gets 50% of their daily income
MAX_DISRUPTION_DAYS = 2   # max 2 payouts in a single week
MIN_ACTIVE_DAYS = 3       # worker must have worked at least 3 days last week to be eligible


# this function takes weekly income and returns a full premium breakdown
def calculate_premium(weekly_income: float) -> dict:
    
    # 5% of whatever worker earns in a week
    total_premium = round(weekly_income * PREMIUM_RATE, 2)
    
    # worker pays 60% of that
    worker_premium = round(total_premium * WORKER_SHARE, 2)
    
    # platform pays reamin 40%
    platform_premium = round(total_premium * PLATFORM_SHARE, 2)
    
    # calc avg daily income
    daily_baseline = round(weekly_income / 7, 2)
    
    # each disruption day pays out 50% of that daily income
    payout_per_day = round(daily_baseline * PAYOUT_RATE, 2)
    
    # maxi in a week is 2 disruption days
    max_payout = round(payout_per_day * MAX_DISRUPTION_DAYS, 2)

    return {
        "weekly_income": weekly_income,
        "total_premium": total_premium,
        "worker_premium": worker_premium,
        "platform_premium": platform_premium,
        "daily_baseline": daily_baseline,
        "payout_per_day": payout_per_day,
        "max_payout": max_payout,
    }


# eligibility criteria
def check_eligibility(active_days_last_week: int) -> tuple[bool, str]:
    
    if active_days_last_week < MIN_ACTIVE_DAYS:
        return False, f"Need at least {MIN_ACTIVE_DAYS} active days last week, you had {active_days_last_week}"

    return True, "Eligible"