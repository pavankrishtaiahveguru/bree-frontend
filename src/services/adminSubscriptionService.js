import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/api/admin`;
const AUTH = { withCredentials: true };

export const fetchAdminSubscriptions = (params = {}) =>
  axios
    .get(`${API}/subscriptions`, {
      ...AUTH,
      params,
    })
    .then((res) => res.data);

export const fetchAdminSubscriptionDetails = (id) =>
  axios.get(`${API}/subscriptions/${id}`, AUTH).then((res) => res.data);

export const pauseAdminSubscription = (id) =>
  axios
    .patch(`${API}/subscriptions/${id}/pause`, {}, AUTH)
    .then((res) => res.data);

export const resumeAdminSubscription = (id) =>
  axios
    .patch(`${API}/subscriptions/${id}/resume`, {}, AUTH)
    .then((res) => res.data);

export const cancelAdminSubscription = (id, reason) =>
  axios
    .patch(`${API}/subscriptions/${id}/cancel`, { reason }, AUTH)
    .then((res) => res.data);

export const fetchAdminSubscriptionAnalytics = () =>
  axios.get(`${API}/subscriptions/analytics`, AUTH).then((res) => res.data);

export const fetchAdminUpcomingRenewals = () =>
  axios
    .get(`${API}/subscriptions/upcoming-renewals`, AUTH)
    .then((res) => res.data);

export const fetchAdminFailedRenewals = () =>
  axios
    .get(`${API}/subscriptions/failed-renewals`, AUTH)
    .then((res) => res.data);
