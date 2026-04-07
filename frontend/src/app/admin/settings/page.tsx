'use client';

import { useEffect, useState } from 'react';
import { getAdminSettings, updateSettings } from '@/lib/api';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

interface Setting {
  key: string;
  value: string;
  label: string;
}

const FIELD_TYPES: Record<string, 'text' | 'toggle' | 'time'> = {
  free_delivery_enabled: 'toggle',
  same_day_enabled: 'toggle',
  same_day_cutoff: 'time',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then((res) => {
        const data = res.data || [];
        setSettings(data);
        const vals: Record<string, string> = {};
        data.forEach((s: Setting) => { vals[s.key] = s.value; });
        setValues(vals);
      })
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(values);
      toast.success('Ayarlar kaydedildi');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-outline-variant/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <Icon name="settings" className="text-on-primary-container" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-on-surface">Site Ayarları</h1>
            <p className="text-sm text-on-surface-variant">Teslimat, ücretler ve genel ayarlar</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          <Icon name="save" size={16} />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {settings.map((setting) => {
          const type = FIELD_TYPES[setting.key] || 'text';
          return (
            <div key={setting.key} className="flex items-center justify-between px-6 py-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{setting.label}</p>
                <p className="text-xs text-on-surface-variant font-mono">{setting.key}</p>
              </div>
              <div className="w-64">
                {type === 'toggle' ? (
                  <button
                    onClick={() => setValues({ ...values, [setting.key]: values[setting.key] === 'true' ? 'false' : 'true' })}
                    className={`relative w-14 h-7 rounded-full transition ${
                      values[setting.key] === 'true' ? 'bg-primary-container' : 'bg-outline-variant/30'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-surface-container-lowest rounded-full shadow transition-transform ${
                      values[setting.key] === 'true' ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                ) : type === 'time' ? (
                  <input
                    type="time"
                    value={values[setting.key] || ''}
                    onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[setting.key] || ''}
                    onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
