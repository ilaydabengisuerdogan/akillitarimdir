let cropPlans = [];

export const addCropPlan = (plan) => {
  const newPlan = {
    id: Date.now(),
    product: plan.product,
    date: plan.date,
    createdAt: new Date().toISOString(),
  };

  cropPlans.push(newPlan);
  return newPlan;
};

export const getCropPlans = () => {
  return cropPlans;
};

export const deleteCropPlan = (id) => {
  cropPlans = cropPlans.filter((p) => p.id !== id);
};