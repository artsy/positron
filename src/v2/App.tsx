import { Boot } from "system/Boot"
import { AppRouter } from "system/router/AppRouter"

export const App: React.FC = () => {
  return (
    <Boot>
      <AppRouter />
    </Boot>
  )
}
