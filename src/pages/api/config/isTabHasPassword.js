import { hasTabPassword } from "utils/config/config";

export default async function handler(req, res) {
  const { type, tab } = req.query;
  const result = hasTabPassword(type, decodeURIComponent(tab));
  res.json({result});
}
