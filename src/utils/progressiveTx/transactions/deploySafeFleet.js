import executeTransactionAndSave from "../executeTransactionAndSave";

const deploySafeFleet = async (sdk, safeAddress, to, data) => {
  await executeTransactionAndSave(sdk, "deployFleet", {
    from: safeAddress,
    to,
    data,
  });
};

export default deploySafeFleet;
