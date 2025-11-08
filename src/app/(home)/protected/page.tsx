import { FC } from "react";

const ProtectedPage: FC = () => {
  return (
    <div>
      Only logged in users should see this
    </div>
  )
}

export { ProtectedPage }