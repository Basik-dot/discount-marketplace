const pool = require('../config/db');

exports.audit = async ({ actorId, action, entity, entityId, meta = {} }) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (actor_id, action, entity, entity_id, meta) VALUES ($1, $2, $3, $4, $5)',
      [actorId || null, action, entity, entityId || null, JSON.stringify(meta)]
    );
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
};
