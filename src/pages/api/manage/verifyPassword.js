import { getManagePassword } from "utils/config/config";

export default async function handler(req, res) {
  const { password } = req.query;
  // TODO
  const result = password === getManagePassword();
  res.json({result});
}
