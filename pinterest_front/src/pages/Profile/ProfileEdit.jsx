import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Avatar, Button, TextField } from "@mui/material";
import "./ProfileEdit.css";
import ProfileHeader from "../../components/layout/ProfileHeader";
import SideMenu from "../../components/layout/SideMenu";
import defaultBanner from "../../assets/images/sky.png";
import defaultAvatar from "../../assets/images/noImgUser.png";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api";

const ProfileEdit = () => {
  const authState = useSelector((state) => state.auth);
  const searchRef = useRef(null);

  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    userName: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), [authState?.token]);
  const navigate = useNavigate();

  const handleSearch = () => {};

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/Profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        if (!active) return;
        const normalized = {
          displayName: data.displayName || "",
          userName: data.userName || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          bannerUrl: data.bannerUrl || "",
        };
        setInitial(normalized);
        setForm(normalized);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (token) run();
    return () => {
      active = false;
    };
  }, [token]);

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/Profile/upload-avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      const { url } = await res.json();
      setForm((s) => ({ ...s, avatarUrl: url }));
      setShowAvatarModal(false);
    }
  };

  const onPickBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/Profile/upload-banner`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      const { url } = await res.json();
      setForm((s) => ({ ...s, bannerUrl: url }));
      setShowBannerModal(false);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const body = {
        UserName: form.userName || undefined,
        DisplayName: form.displayName || undefined,
        Bio: form.bio || undefined,
        ProfileImageUrl: form.avatarUrl || undefined,
        BannerImageUrl: form.bannerUrl || undefined,
      };
      const res = await fetch(`${API_BASE}/Profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      navigate("/profile-boards");
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    try {
      setSaving(true);
      const resetRes = await fetch(`${API_BASE}/Profile/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resetRes.ok) throw new Error("Failed to reset profile");


      const res = await fetch(`${API_BASE}/Profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = {
          displayName: data.displayName || "",
          userName: data.userName || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          bannerUrl: data.bannerUrl || "",
        };
        setInitial(normalized);
        setForm(normalized);
      }
    } finally {
      setSaving(false);
    }
  };

  const bannerUrl = form.bannerUrl || defaultBanner;
  const avatarUrl = form.avatarUrl || defaultAvatar;

  return (
    <div className="pe-layout">
      <div>
        <SideMenu />
      </div>

      <div className="pe-main">
        <ProfileHeader title="Edit profile" user={authState?.user} onSearch={handleSearch} searchRef={searchRef} onFocusSearch={() => {}} />

        <div className="pe-wrap">

          <div className="pe-card">
            <div className="pe-banner" style={{ backgroundImage: `url(${bannerUrl})` }}>
              <button type="button" className="pe-banner-btn" onClick={() => setShowBannerModal(true)}>
                Change header image
              </button>
            </div>

            <div className="pe-body">
              <div className="pe-avatar-col">
                <div className="pe-avatar-box">
                  <img className="pe-avatar" src={avatarUrl} alt="avatar" />
                </div>
                <button type="button" className="pe-change-image-btn" onClick={() => setShowAvatarModal(true)}>
                  Change image
                </button>
              </div>

              <div className="pe-form">
                <div className="pe-field">
                  <div className="pe-label">Your name</div>
                  <input className="pe-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Your name" />
                </div>
                <div className="pe-field">
                  <div className="pe-label">Nickname</div>
                  <input className="pe-input" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} placeholder="Nickname" />
                </div>
                <div className="pe-field">
                  <div className="pe-label">Short bio</div>
                  <textarea className="pe-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell about you..." rows={4} />
                </div>
              </div>

              <div className="pe-actions">
                <button onClick={onReset} disabled={loading || saving} className="pe-btn pe-btn-reset">Reset</button>
                <button onClick={onSave} disabled={loading || saving} className="pe-btn pe-btn-save">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <div className="pe-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="pe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pe-modal-header">
              <div className="pe-modal-title">Change avatar</div>
              <button className="pe-modal-close" onClick={() => setShowAvatarModal(false)} aria-label="Close">×</button>
            </div>
            <label className="pe-modal-btn">
              <input id="avatar-input" hidden type="file" accept="image/*" onChange={onPickAvatar} />
              Choose image
            </label>
          </div>
        </div>
      )}

      {showBannerModal && (
        <div className="pe-modal-overlay" onClick={() => setShowBannerModal(false)}>
          <div className="pe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pe-modal-header">
              <div className="pe-modal-title">Change header</div>
              <button className="pe-modal-close" onClick={() => setShowBannerModal(false)} aria-label="Close">×</button>
            </div>
            <label className="pe-modal-btn">
              <input id="banner-input" hidden type="file" accept="image/*" onChange={onPickBanner} />
              Choose image
            </label>
            <div className="pe-modal-note">(Recommended size 1720x260px)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEdit;


