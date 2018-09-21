import { destroy, save, where } from "./model"

export const index = (req, res, next) => {
  where(req.query, (err, results) => {
    if (err) {
      return next(err)
    }
    res.send(results)
  })
}

export const saveSession = (req, res, next) => {
  save({ ...req.body, id: req.params.id }, (err, session) => {
    if (err) {
      return next(err)
    }
    res.send(session)
  })
}

export const deleteSession = (req, res, next) => {
  destroy(req.params.id, err => {
    if (err) {
      return next(err)
    }
    res.send({ id: req.params.id })
  })
}
