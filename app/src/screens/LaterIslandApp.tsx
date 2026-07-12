import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingState } from '../components/LoadingState';
import { PhoneFrame } from '../components/PhoneFrame';
import { Header } from './Header';
import { SettingsScreen } from './SettingsScreen';
import { TrashScreen } from './TrashScreen';
import { TabBar } from './TabBar';
import { AddTab } from './tabs/AddTab';
import { CategoryTab } from './tabs/CategoryTab';
import { DoneTab } from './tabs/DoneTab';
import { HomeTab } from './tabs/HomeTab';
import { TagsTab } from './tabs/TagsTab';
import { useLaterIslandState } from './useLaterIslandState';
import { useScrollThumb } from './useScrollThumb';

const SCROLL_EL_ID = 'ls-scroll-content';

export function LaterIslandApp() {
  const s = useLaterIslandState();
  const thumbRef = useScrollThumb(SCROLL_EL_ID);

  return (
    <PhoneFrame background="#E6F1E3" language={s.settingsLanguage}>
      {!s.showSettings && !s.showTrash && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Header
            searchOpen={s.searchOpen}
            searchQuery={s.searchQuery}
            setSearchQuery={s.setSearchQuery}
            toggleSearch={s.toggleSearch}
            closeSearch={s.closeSearch}
            menuOpen={s.menuOpen}
            toggleMenu={s.toggleMenu}
            closeMenu={s.closeMenu}
            sortSubmenuOpen={s.sortSubmenuOpen}
            toggleSortSubmenu={s.toggleSortSubmenu}
            sortOrder={s.sortOrder}
            selectSort={s.selectSort}
            goSettings={s.goSettings}
            language={s.settingsLanguage}
            setShowTrash={s.setShowTrash}
          />

          <div id={SCROLL_EL_ID} style={{ position: 'absolute', top: 76, left: 0, right: 0, bottom: 76, overflowY: 'auto' }}>
            {s.dataLoading && s.activeTab !== 'add' ? (
              <LoadingState language={s.settingsLanguage} />
            ) : (
              <>
                {s.activeTab === 'home' && (
                  <HomeTab
                    pendingContents={s.pendingContents}
                    language={s.settingsLanguage}
                    onEditItem={s.startEditContent}
                    onDeleteItem={s.openConfirmDeleteContent}
                  />
                )}
                {s.activeTab === 'category' && (
                  <CategoryTab
                    categoryRows={s.categoryRows}
                    selectedCategory={s.selectedCategory}
                    categoryFilteredContents={s.categoryFilteredContents}
                    backFromCategory={s.backFromCategory}
                    language={s.settingsLanguage}
                    onEditItem={s.startEditContent}
                    onDeleteItem={s.openConfirmDeleteContent}
                    onUpdateCategoryName={s.updateCategoryName}
                    onDeleteCategory={s.openConfirmDeleteCategory}
                  />
                )}
                {s.activeTab === 'add' && (
                  <AddTab
                    form={s.form}
                    setFormTitle={s.setFormTitle}
                    setFormUrl={s.setFormUrl}
                    setFormSummary={s.setFormSummary}
                    categoryDropdownOpen={s.categoryDropdownOpen}
                    toggleCategoryDropdown={s.toggleCategoryDropdown}
                    selectedCategoryLabel={s.selectedCategoryLabel}
                    formCategoryRows={s.formCategoryRows}
                    newCategoryInput={s.newCategoryInput}
                    setNewCategoryInput={s.setNewCategoryInput}
                    addNewCategory={s.addNewCategory}
                    tagDropdownOpen={s.tagDropdownOpen}
                    toggleTagDropdown={s.toggleTagDropdown}
                    selectedFormTagChips={s.selectedFormTagChips}
                    formTagRows={s.formTagRows}
                    newTagInput={s.newTagInput}
                    setNewTagInput={s.setNewTagInput}
                    addNewTag={s.addNewTag}
                    generateAI={s.generateAI}
                    saveContent={s.saveContent}
                    language={s.settingsLanguage}
                    isEditing={!!s.editingContentId}
                    onCancelEdit={s.cancelEditContent}
                  />
                )}
                {s.activeTab === 'tags' && (
                  <TagsTab
                    tagRows={s.tagRows}
                    selectedTag={s.selectedTag}
                    tagFilteredContents={s.tagFilteredContents}
                    backFromTag={s.backFromTag}
                    language={s.settingsLanguage}
                    onEditItem={s.startEditContent}
                    onDeleteItem={s.openConfirmDeleteContent}
                    onUpdateTagName={s.updateTagName}
                    onDeleteTag={s.openConfirmDeleteTag}
                  />
                )}
                {s.activeTab === 'done' && (
                  <DoneTab
                    doneContents={s.doneContents}
                    language={s.settingsLanguage}
                    onEditItem={s.startEditContent}
                    onDeleteItem={s.openConfirmDeleteContent}
                  />
                )}
              </>
            )}
          </div>

          <div
            ref={thumbRef}
            style={{
              position: 'absolute',
              right: 3,
              width: 4,
              borderRadius: 4,
              background: '#E0E8E1',
              top: 76,
              height: '20%',
              pointerEvents: 'none',
            }}
          />

          <TabBar activeTab={s.activeTab} setTab={s.setTab} language={s.settingsLanguage} />
        </div>
      )}

      {s.showSettings && (
        <SettingsScreen
          settingsLanguage={s.settingsLanguage}
          setSettingsLanguage={s.setSettingsLanguage}
          backFromSettings={s.backFromSettings}
          openLogoutConfirm={() => s.openConfirm('logout')}
          openDeleteConfirm={() => s.openConfirm('delete')}
          userDisplayName={s.userDisplayName}
          userEmail={s.userEmail}
        />
      )}

      {s.showTrash && (
        <TrashScreen
          language={s.settingsLanguage}
          onBack={() => s.setShowTrash(false)}
          trashItems={s.trashItems}
          restoreTrashItem={s.restoreTrashItem}
          openConfirmDeletePermanently={s.openConfirmDeletePermanently}
        />
      )}

      {s.activeConfirm && (
        <ConfirmDialog
          title={s.activeConfirm.title}
          body={s.activeConfirm.body ?? ''}
          actionLabel={s.activeConfirm.actionLabel}
          color={s.activeConfirm.color}
          onCancel={s.closeConfirm}
          onConfirm={s.activeConfirm.onConfirm}
          language={s.settingsLanguage}
          error={s.activeConfirm.error}
          confirming={s.activeConfirm.confirming}
        />
      )}
    </PhoneFrame>
  );
}
