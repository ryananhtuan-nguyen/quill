import BillingForm from '@/components/BillingForm'
import { getUserSubscriptionPlan } from '@/libs/stripe'

const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan()

  return <BillingForm subscriptionPlan={subscriptionPlan} />
}

export default Page
