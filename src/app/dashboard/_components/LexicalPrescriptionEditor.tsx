"use client";

/**
 * Lexical is a headless editor framework: it does not ship a toolbar or menus
 * (unlike TinyMCE). Formatting UI is provided here on purpose — see
 * https://lexical.dev/docs/getting-started/react
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
    INSERT_TABLE_COMMAND,
    $getTableCellNodeFromLexicalNode,
    $insertTableColumnAtSelection,
    $insertTableRowAtSelection,
    registerTablePlugin,
    registerTableSelectionObserver,
    TableCellNode,
    TableNode,
    TableRowNode,
} from "@lexical/table";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $setBlocksType } from "@lexical/selection";
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronDown,
    Heading2,
    Italic,
    Link2,
    List,
    ListOrdered,
    Pilcrow,
    Redo2,
    Rows3,
    Table2,
    Underline,
    Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const theme = {
    paragraph: "mb-1 text-[14px] leading-relaxed text-slate-800",
    quote: "border-l-4 border-indigo-200 pl-3 italic text-slate-600",
    heading: {
        h1: "text-2xl font-bold mb-2 text-slate-900",
        h2: "text-xl font-bold mb-2 text-slate-900",
        h3: "text-lg font-semibold mb-1 text-slate-900",
    },
    list: {
        nested: {
            listitem: "list-none",
        },
        ol: "list-decimal ml-6 mb-2",
        ul: "list-disc ml-6 mb-2",
        listitem: "mb-0.5",
    },
    link: "text-indigo-600 underline underline-offset-2",
    text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
    },
    table: "border-collapse w-full my-3 overflow-visible text-sm",
    tableScrollableWrapper: "overflow-x-auto",
    tableCell: "border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800",
    tableCellHeader: "bg-slate-100 font-semibold text-slate-900",
    tableRow: "",
};

/**
 * LexicalComposer seeds the document with a default empty paragraph before plugins run.
 * If we skip when `root.getFirstChild()` exists, saved HTML never loads on "Edit Prescription".
 * We therefore replace the root exactly once per editor mount (parent remounts via `key` when reopening).
 */
function InitialHtmlPlugin({ html }: { html: string }) {
    const [editor] = useLexicalComposerContext();
    const didReplaceRoot = useRef(false);

    useLayoutEffect(() => {
        if (didReplaceRoot.current) {
            return;
        }
        didReplaceRoot.current = true;
        const snapshot = html;
        editor.update(() => {
            const root = $getRoot();
            root.clear();
            const dom = new DOMParser().parseFromString(snapshot || "<p></p>", "text/html");
            const nodes = $generateNodesFromDOM(editor, dom.body);
            if (nodes.length > 0) {
                root.append(...nodes);
            } else {
                root.append($createParagraphNode());
            }
        });
    }, [editor, html]);

    return null;
}

function TableRegistrationPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregisterCommands = registerTablePlugin(editor, undefined);
        const unregisterSelection = registerTableSelectionObserver(editor, true);
        return () => {
            unregisterCommands();
            unregisterSelection();
        };
    }, [editor]);

    return null;
}

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [cursorInTableCell, setCursorInTableCell] = useState(false);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                    setCursorInTableCell(false);
                    return;
                }
                const anchorNode = selection.anchor.getNode();
                setCursorInTableCell($getTableCellNodeFromLexicalNode(anchorNode) !== null);
            });
        });
    }, [editor]);

    const fmt = (format: "bold" | "italic" | "underline") => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const align = (value: "left" | "center" | "right") => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
    };

    const setHeading = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode("h2"));
            }
        });
    };

    const setParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const insertLink = () => {
        const url = window.prompt("Link URL (https://…)");
        if (url == null || url === "") return;
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    };

    const insertTable = () => {
        const rawRows = window.prompt("Table rows (1–20)", "3");
        const rawCols = window.prompt("Table columns (1–10)", "3");
        if (rawRows == null || rawCols == null) return;
        const rows = Math.min(20, Math.max(1, parseInt(rawRows, 10) || 3));
        const columns = Math.min(10, Math.max(1, parseInt(rawCols, 10) || 3));
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: String(rows),
            columns: String(columns),
            includeHeaders: { rows: true, columns: false },
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2 mb-2">
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Undo">
                <Undo2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Redo">
                <Redo2 className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden />
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => fmt("bold")} title="Bold">
                <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => fmt("italic")} title="Italic">
                <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => fmt("underline")} title="Underline">
                <Underline className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden />
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={setHeading} title="Heading 2">
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={setParagraph} title="Paragraph">
                <Pilcrow className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden />
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => align("left")} title="Align left">
                <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => align("center")} title="Align center">
                <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => align("right")} title="Align right">
                <AlignRight className="h-4 w-4" />
            </Button>
            <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden />
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Bullet list">
                <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Numbered list">
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={insertLink} title="Link">
                <Link2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 px-2 rounded-lg gap-1" onClick={insertTable} title="Insert table">
                <Table2 className="h-4 w-4" />
                <span className="text-xs font-medium">Table</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg px-3"
                        disabled={!cursorInTableCell}
                        title={cursorInTableCell ? "Add rows and columns" : "Click inside a table cell first"}
                    >
                        <Rows3 className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-medium max-sm:hidden">Edit table</span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60 rounded-xl p-1.5" sideOffset={6}>
                    <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-2 py-1.5">
                        Rows
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        className="rounded-lg cursor-pointer py-2.5 text-sm"
                        onSelect={() => {
                            editor.update(() => {
                                $insertTableRowAtSelection(false);
                            });
                        }}
                    >
                        Add row above
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="rounded-lg cursor-pointer py-2.5 text-sm"
                        onSelect={() => {
                            editor.update(() => {
                                $insertTableRowAtSelection(true);
                            });
                        }}
                    >
                        Add row below
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-2 py-1.5">
                        Columns
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        className="rounded-lg cursor-pointer py-2.5 text-sm"
                        onSelect={() => {
                            editor.update(() => {
                                $insertTableColumnAtSelection(false);
                            });
                        }}
                    >
                        Add column left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="rounded-lg cursor-pointer py-2.5 text-sm"
                        onSelect={() => {
                            editor.update(() => {
                                $insertTableColumnAtSelection(true);
                            });
                        }}
                    >
                        Add column right
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export type LexicalPrescriptionEditorProps = {
    initialHtml: string;
    onHtmlChange: (html: string) => void;
    className?: string;
};

export function LexicalPrescriptionEditor({ initialHtml, onHtmlChange, className }: LexicalPrescriptionEditorProps) {
    const initialConfig = {
        namespace: "PrescriptionEditor",
        theme,
        onError: (error: Error) => {
            console.error(error);
        },
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, TableCellNode, TableRowNode, TableNode],
        editable: true,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
                <ToolbarPlugin />
                <TableRegistrationPlugin />
                <div className="relative overflow-x-auto">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="min-h-[520px] px-3 py-2 outline-none prose prose-sm max-w-none"
                                aria-placeholder="Enter diagnosis, medicines and instructions…"
                                placeholder={(isEditable) =>
                                    isEditable ? (
                                        <div className="pointer-events-none absolute left-3 top-2 text-slate-400 text-sm select-none">
                                            Enter diagnosis, medicines and instructions…
                                        </div>
                                    ) : null
                                }
                            />
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin />
                <AutoFocusPlugin />
                <InitialHtmlPlugin html={initialHtml} />
                <OnChangePlugin
                    onChange={(editorState, editor) => {
                        editorState.read(() => {
                            onHtmlChange($generateHtmlFromNodes(editor, null));
                        });
                    }}
                />
            </div>
        </LexicalComposer>
    );
}
