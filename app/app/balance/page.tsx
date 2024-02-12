import { getAuthServerSession } from '@/utils/auth'
import { redirect } from 'next/navigation'

const BalancePage = async () => {
  const session = await getAuthServerSession()

  if (!session?.user.id) {
    return redirect('/api/auth/signin')
  }

  // console.log({ transactions });
  return (
    <div>
      <h1>Balance Page</h1>

      {/* Add your balance-related components and logic here */}
    </div>
  )
}

export default BalancePage
