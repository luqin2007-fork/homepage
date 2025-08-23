import { getTabPassword } from "utils/config/config";

export default async function handler(req, res) {
  const { type, tab, password } = req.query;
  const result = getTabPassword(type, decodeURIComponent(tab)) === password;
  res.json({result});
}
