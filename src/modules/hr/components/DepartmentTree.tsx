import { useState, useMemo } from "react";
import { Department } from "../services/departmentService";
import { ChevronRight, ChevronDown, Folder, File, Plus } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface DepartmentTreeProps {
    departments: Department[];
    onSelect: (department: Department) => void;
    selectedCode: string | null;
    onAddRoot: () => void;
    onAddChild: (parentCode: string) => void;
}

interface TreeNode {
    data: Department;
    children: TreeNode[];
}

const buildTree = (departments: Department[]): TreeNode[] => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Sort by code length then code value to ensure parents come first? 
    // Actually we can just map all first.
    departments.forEach(p => {
        const code = p.code?.trim();
        if (code) {
            map.set(code, { data: p, children: [] });
        }
    });

    // Build hierarchy
    departments.forEach(p => {
        const code = p.code?.trim();
        if (code) {
            const node = map.get(code);
            if (!node) return;

            const parentCode = p.parentCode?.trim();
            if (parentCode && map.has(parentCode)) {
                map.get(parentCode)?.children.push(node);
            } else {
                // If parent code is specified but not found, currently treating as root. 
                // Alternatively, should we only treat null parentCode as root?
                // Depending on data integrity. Safer to append to roots if parent missing.
                roots.push(node);
            }
        }
    });

    // Sort children by code
    const sortNodes = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => a.data.code.localeCompare(b.data.code));
        nodes.forEach(n => sortNodes(n.children));
    };
    sortNodes(roots);

    return roots;
};

const TreeNodeItem = ({
    node,
    level,
    onSelect,
    selectedCode,
    onAddChild
}: {
    node: TreeNode,
    level: number,
    onSelect: (d: Department) => void,
    selectedCode: string | null,
    onAddChild: (code: string) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(true); // Default expanded
    const trimmedCode = node.data.code?.trim();
    const hasChildren = node.children.length > 0;
    const isSelected = selectedCode?.trim() === trimmedCode;

    const handleExpandWrapper = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-secondary/50 rounded-sm text-sm group",
                    isSelected && "bg-secondary font-medium text-primary"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => onSelect(node.data)}
            >
                <div
                    className={cn("p-0.5 rounded-sm hover:bg-muted/50 transition-colors", !hasChildren && "invisible")}
                    onClick={handleExpandWrapper}
                >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>

                {hasChildren ? <Folder className="w-4 h-4 text-sidebar" /> : <File className="w-4 h-4 text-gray-400" />}

                <span className="truncate flex-1">
                    <span className="font-sans text-xs text-muted-foreground mr-2 opacity-70">{trimmedCode}</span>
                    {node.data.name}
                </span>

                {trimmedCode && trimmedCode.length < 6 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (node.data.code) onAddChild(node.data.code);
                        }}
                        title="Add Child"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <TreeNodeItem
                            key={child.data.code}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedCode={selectedCode}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const DepartmentTree = ({ departments, onSelect, selectedCode, onAddRoot, onAddChild }: DepartmentTreeProps) => {
    const treeData = useMemo(() => buildTree(departments), [departments]);

    return (
        <div className="flex flex-col h-full border-r border-border bg-card/50">
            <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <span className="text-sm font-semibold text-muted-foreground">Deparments</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onAddRoot} title="Add Root Level">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 pb-10">
                    {treeData.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-10">
                            No departments found. <br /> Click + to add one.
                        </div>
                    ) : (
                        treeData.map(node => (
                            <TreeNodeItem
                                key={node.data.code}
                                node={node}
                                level={0}
                                onSelect={onSelect}
                                selectedCode={selectedCode}
                                onAddChild={onAddChild}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
