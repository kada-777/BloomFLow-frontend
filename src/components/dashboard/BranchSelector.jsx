import { ChevronDown } from "lucide-react";

export default function BranchSelector({ branches, selectedBranch, onChange, disabled, loading, error }) {
  return (
    <label className="dashboard-branch-selector">
      <span>Branch</span>
      <div>
        <select
          value={disabled ? "my-branch" : selectedBranch}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || loading || Boolean(error)}
          aria-label="Select branch"
        >
          {disabled ? (
            <option value="my-branch">My Branch</option>
          ) : (
            <option value="all">All Branches</option>
          )}
          {!disabled && branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </div>
    </label>
  );
}
