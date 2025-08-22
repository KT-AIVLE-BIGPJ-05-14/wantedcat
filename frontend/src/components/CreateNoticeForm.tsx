import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import type { Notice } from "./NoticeCard";

interface CreateNoticeFormProps {
  onClose: () => void;
  onSubmit: (noticeData: Omit<Notice, 'id' | 'views' | 'createdAt'>) => void;
  editingNotice?: Notice | null;
}

export function CreateNoticeForm({ onClose, onSubmit, editingNotice }: CreateNoticeFormProps) {
  const [formData, setFormData] = useState(() => {
    // 초기값을 함수로 설정하여 editingNotice가 있을 때 바로 설정
    if (editingNotice && editingNotice.id) {
      return {
        title: editingNotice.title || "",
        content: editingNotice.content || "",
        author: editingNotice.author || "",
        category: editingNotice.category || "",
        priority: editingNotice.priority || "일반" as '일반' | '중요' | '긴급',
        pinned: editingNotice.pinned || (editingNotice as any).pinned || false
      };
    }
    return {
      title: "",
      content: "",
      author: "",
      category: "",
      priority: "일반" as '일반' | '중요' | '긴급',
      pinned: false
    };
  });

  // Pre-fill form when editing - only update if editingNotice changes and has different values
  useEffect(() => {
    if (editingNotice && editingNotice.id) {
      console.log('Setting form data for editing:', editingNotice); // 디버깅용
      console.log('editingNotice.category:', editingNotice.category); // 카테고리 값 확인
      console.log('editingNotice.pinned:', editingNotice.pinned); // pinned 확인
      console.log('editingNotice.pinned:', (editingNotice as any).pinned); // pinned 필드 확인
      
      const newFormData = {
        title: editingNotice.title || "",
        content: editingNotice.content || "",
        author: editingNotice.author || "",
        category: editingNotice.category || "",
        priority: editingNotice.priority || "일반" as '일반' | '중요' | '긴급',
        pinned: editingNotice.pinned || (editingNotice as any).pinned || false
      };
      
      // 현재 formData와 다를 때만 업데이트
      setFormData(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newFormData)) {
          console.log('Updating form data with new values');
          return newFormData;
        }
        return prev;
      });
    } else if (editingNotice === null) {
      console.log('Resetting form data'); // 디버깅용
      setFormData({
        title: "",
        content: "",
        author: "",
        category: "",
        priority: "일반",
        pinned: false
      });
    }
  }, [editingNotice]);

  const categories = [
    "모임 안내",
    "봉사활동",
    "운영 안내",
    "이벤트",
    "업데이트"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2>{editingNotice ? '공지사항 수정' : '공지사항 작성'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="공지사항 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select 
                  key={`category-${editingNotice?.id || 'new'}`}
                  value={formData.category || ""} 
                  onValueChange={(value: string) => {
                    console.log('Category changed to:', value); // 디버깅용
                    console.log('Available categories:', categories); // 사용 가능한 카테고리 확인
                    console.log('Current formData.category before change:', formData.category); // 변경 전 값
                    setFormData(prev => ({ ...prev, category: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 디버깅용 표시 */}
                <div className="text-xs text-gray-500">
                  현재 카테고리: {formData.category || '선택되지 않음'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">우선순위</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, priority: value as '일반' | '중요' | '긴급' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="일반">일반</SelectItem>
                    <SelectItem value="중요">중요</SelectItem>
                    <SelectItem value="긴급">긴급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">작성자 *</Label>
              <Input
                id="author"
                placeholder="작성자명을 입력하세요"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pinned"
                checked={formData.pinned}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, pinned: !!checked }))}
              />
              <Label htmlFor="pinned">상단 고정</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">공지 내용 *</Label>
              <Textarea
                id="content"
                placeholder="공지사항 내용을 작성해주세요"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              공지 등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}