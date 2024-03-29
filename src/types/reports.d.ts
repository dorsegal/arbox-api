export declare namespace Reports {
  export type MemberProperties = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    user_fk: number;
    medical_cert: number;
    phone: string;
    allow_sms: string;
    allow_mailing_list: string;
    has_waiver: number;
    restricted: number;
    has_basics_workshop: number;
    has_nutrition_counseling: number;
    has_professional_meeting: number;
    has_insurance: number;
    location: string;
    epidemic_statement: number;
    membershipId: number;
    membership_type: string;
  };

  export type SuspendedUser = {
    id: number;
    membership_user_fk: number;
    box_fk: number;
    user_fk: number;
    start_date: string;
    end_date: string;
    total_days: number;
    status: string;
    suspend_reason_fk?: any;
    comment: string;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    location: string;
    location_box_fk: number;
    first_name: string;
    last_name: string;
    address?: any;
    phone: string;
    rivhit_customer_id: string;
    type: string;
    name: string;
    mt_price: number;
    period_time_unit?: any;
    period_amount?: any;
    is_recurring_payment: number;
    start_membership: string;
    end_membership: string;
    price: number;
    suspend_reason?: any;
    amount: number;
    membership_days: number;
    price_per_day: number;
    price_per_month: number;
    hold_value: number;
  };
}
