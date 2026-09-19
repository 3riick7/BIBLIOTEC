exports.ok = (res, datos, codigo = 200) => res.status(codigo).json({ ok: true, datos });
exports.error = (res, mensaje, codigo = 400) => res.status(codigo).json({ ok: false, mensaje });
