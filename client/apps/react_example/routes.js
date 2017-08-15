import App from './components/App'
import { renderReactLayout } from 'client/components/react/utils/renderReactLayout'

export function index (req, res, next) {
  const layout = renderReactLayout({
    basePath: req.app.get('views'),
    blocks: {
      // head: 'meta.jade',
      body: App
    },
    locals: {
      ...res.locals,
      assetPackage: 'react_example'
    },
    data: {
      name: 'Leif',
      description: 'hello hi how are you'
    },
    templates: {
      MyJadeView: 'my_jade_view.jade'
    }
  })

  res.send(layout)
}
