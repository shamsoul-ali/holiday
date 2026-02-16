-- =====================================================
-- Holiday AI - Wallet System Database Migration
-- Version: 1.0
-- Module: Digital Wallet & Savings Goals
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. WALLETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MYR',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'frozen', 'closed')),
    daily_limit DECIMAL(12, 2),
    monthly_limit DECIMAL(12, 2),
    last_transaction_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, currency),
    CHECK (currency IN ('MYR', 'SGD', 'USD', 'IDR', 'THB', 'EUR', 'GBP', 'AUD'))
);

-- Indexes for performance
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallets_updated_at ON wallets(updated_at DESC);

-- Comments
COMMENT ON TABLE wallets IS 'User digital wallets with multi-currency support';
COMMENT ON COLUMN wallets.balance IS 'Current wallet balance (always >= 0)';
COMMENT ON COLUMN wallets.status IS 'Wallet status: active, suspended, frozen, closed';

-- =====================================================
-- 2. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'transfer', 'refund', 'fee')),
    category VARCHAR(50) CHECK (category IN ('topup', 'booking', 'withdrawal', 'savings_contribution', 'loan_repayment', 'commission', 'cashback', 'penalty')),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    metadata JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    payment_method VARCHAR(50),
    external_transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CHECK (
        (type = 'credit' AND balance_after = balance_before + amount) OR
        (type = 'debit' AND balance_after = balance_before - amount) OR
        type IN ('transfer', 'refund', 'fee')
    )
);

-- Indexes for performance
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(reference_id, reference_type);

-- Comments
COMMENT ON TABLE transactions IS 'All wallet transactions with audit trail';
COMMENT ON COLUMN transactions.type IS 'Transaction type: credit (add funds), debit (spend funds)';
COMMENT ON COLUMN transactions.balance_before IS 'Wallet balance before transaction';
COMMENT ON COLUMN transactions.balance_after IS 'Wallet balance after transaction';

-- =====================================================
-- 3. SAVINGS GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    trip_id UUID,
    goal_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'achieved', 'cancelled')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    auto_transfer_enabled BOOLEAN DEFAULT false,
    milestone_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    achieved_at TIMESTAMP,

    -- Constraints
    CHECK (target_date >= CURRENT_DATE),
    CHECK (current_amount <= target_amount OR status = 'achieved')
);

-- Indexes
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_wallet_id ON savings_goals(wallet_id);
CREATE INDEX idx_savings_goals_trip_id ON savings_goals(trip_id);
CREATE INDEX idx_savings_goals_status ON savings_goals(status);
CREATE INDEX idx_savings_goals_target_date ON savings_goals(target_date);

-- Comments
COMMENT ON TABLE savings_goals IS 'User savings goals for trips';
COMMENT ON COLUMN savings_goals.priority IS '1 = highest priority, 5 = lowest';
COMMENT ON COLUMN savings_goals.auto_transfer_enabled IS 'Auto-transfer from wallet balance';

-- =====================================================
-- 4. RECURRING CONTRIBUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recurring_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
    next_deduction_date DATE NOT NULL,
    last_deduction_date DATE,
    total_contributions INTEGER DEFAULT 0,
    total_amount_contributed DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    auto_increase_percentage DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recurring_contributions_goal_id ON recurring_contributions(goal_id);
CREATE INDEX idx_recurring_contributions_next_date ON recurring_contributions(next_deduction_date);
CREATE INDEX idx_recurring_contributions_active ON recurring_contributions(is_active, next_deduction_date);

-- Comments
COMMENT ON TABLE recurring_contributions IS 'Automated recurring contributions to savings goals';
COMMENT ON COLUMN recurring_contributions.auto_increase_percentage IS 'Auto-increase contribution amount by % annually';

-- =====================================================
-- 5. SAVINGS CONTRIBUTIONS TABLE (Transaction Log)
-- =====================================================
CREATE TABLE IF NOT EXISTS savings_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    contribution_type VARCHAR(20) NOT NULL CHECK (contribution_type IN ('manual', 'recurring', 'cashback', 'bonus')),
    notes TEXT,
    contributed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_savings_contributions_goal_id ON savings_contributions(goal_id);
CREATE INDEX idx_savings_contributions_contributed_at ON savings_contributions(contributed_at DESC);

-- =====================================================
-- 6. WALLET TOPUP METHODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_topup_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('credit_card', 'debit_card', 'bank_transfer', 'duitnow', 'boost', 'grabpay', 'touchngo')),
    provider VARCHAR(100),
    account_number_masked VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    external_token VARCHAR(255),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_topup_methods_user_id ON wallet_topup_methods(user_id);
CREATE INDEX idx_topup_methods_default ON wallet_topup_methods(user_id, is_default);

-- =====================================================
-- 7. WALLET LIMITS & SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_settings (
    user_id UUID PRIMARY KEY,
    daily_topup_limit DECIMAL(10, 2) DEFAULT 5000.00,
    monthly_topup_limit DECIMAL(10, 2) DEFAULT 50000.00,
    daily_spending_limit DECIMAL(10, 2),
    monthly_spending_limit DECIMAL(10, 2),
    auto_savings_enabled BOOLEAN DEFAULT false,
    auto_savings_percentage DECIMAL(5, 2) DEFAULT 10.00,
    notification_preferences JSONB DEFAULT '{"low_balance": true, "goal_milestone": true, "transaction": true}'::jsonb,
    security_settings JSONB DEFAULT '{"require_pin": true, "biometric_enabled": false}'::jsonb,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE wallet_settings IS 'User-specific wallet limits and preferences';

-- =====================================================
-- 8. WALLET AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    action VARCHAR(50) NOT NULL,
    performed_by UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_wallet_id ON wallet_audit_log(wallet_id);
CREATE INDEX idx_audit_log_created_at ON wallet_audit_log(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_contributions_updated_at BEFORE UPDATE ON recurring_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(p_wallet_id UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (SELECT balance FROM wallets WHERE id = p_wallet_id);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate savings goal progress percentage
CREATE OR REPLACE FUNCTION calculate_savings_progress(p_goal_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_current_amount DECIMAL;
    v_target_amount DECIMAL;
BEGIN
    SELECT current_amount, target_amount
    INTO v_current_amount, v_target_amount
    FROM savings_goals
    WHERE id = p_goal_id;

    IF v_target_amount = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND((v_current_amount / v_target_amount) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's total savings
CREATE OR REPLACE FUNCTION get_total_savings(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(current_amount), 0)
        FROM savings_goals
        WHERE user_id = p_user_id AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Wallet Summary
CREATE OR REPLACE VIEW wallet_summary AS
SELECT
    w.id AS wallet_id,
    w.user_id,
    w.balance,
    w.currency,
    w.status,
    COUNT(DISTINCT t.id) AS total_transactions,
    COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) AS total_credits,
    COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) AS total_debits,
    w.last_transaction_at,
    w.created_at
FROM wallets w
LEFT JOIN transactions t ON w.id = t.wallet_id AND t.status = 'completed'
GROUP BY w.id;

-- View: Savings Goals Summary
CREATE OR REPLACE VIEW savings_goals_summary AS
SELECT
    sg.id AS goal_id,
    sg.user_id,
    sg.goal_name,
    sg.target_amount,
    sg.current_amount,
    sg.target_date,
    sg.status,
    ROUND((sg.current_amount / sg.target_amount) * 100, 2) AS progress_percentage,
    sg.target_amount - sg.current_amount AS remaining_amount,
    sg.target_date - CURRENT_DATE AS days_remaining,
    COUNT(sc.id) AS total_contributions,
    COALESCE(SUM(sc.amount), 0) AS total_contributed,
    sg.created_at,
    sg.achieved_at
FROM savings_goals sg
LEFT JOIN savings_contributions sc ON sg.id = sc.goal_id
GROUP BY sg.id;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Sample wallet settings
INSERT INTO wallet_settings (user_id, daily_topup_limit, monthly_topup_limit)
VALUES
    ('00000000-0000-0000-0000-000000000001', 5000.00, 50000.00)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- GRANTS (Adjust based on your DB user setup)
-- =====================================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO holiday_ai_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO holiday_ai_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO holiday_ai_user;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
