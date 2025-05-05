import { useQuery } from "@tanstack/react-query";
import { SmartContractVerification } from "./smart-contract-verification";

interface BlockchainInfoProps {
  userId: number;
}

export function BlockchainInfo({ userId }: BlockchainInfoProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/transactions`],
    enabled: !!userId
  });
  
  return <SmartContractVerification userId={userId} />;
}
